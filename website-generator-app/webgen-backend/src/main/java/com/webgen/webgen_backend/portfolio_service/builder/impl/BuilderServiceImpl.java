package com.webgen.webgen_backend.portfolio_service.builder.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.dto.portfolio.JobStatusDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionContentDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionPlanDTO;
import com.webgen.webgen_backend.entity.GeneratedVersion;
import com.webgen.webgen_backend.entity.Portfolio;
import com.webgen.webgen_backend.entity.PortfolioSection;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio_service.builder.BuilderService;
import com.webgen.webgen_backend.portfolio_service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio_service.job.GenerateJobService;
import com.webgen.webgen_backend.portfolio_service.job.SectionGenerationMessage;
import com.webgen.webgen_backend.portfolio_service.parser.BuilderResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.BuilderPromptBuilder;
import com.webgen.webgen_backend.portfolio_service.validator.JsxValidatorService;
import com.webgen.webgen_backend.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.repository.PortfolioRepository;
import com.webgen.webgen_backend.repository.PortfolioSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuilderServiceImpl implements BuilderService {
    private final OpenAiChatModel openAiChatModel; // Uses primary (gpt-5)
    private final ClarifierService clarifierService;
    private final BuilderPromptBuilder builderPromptBuilder;
    private final BuilderResponseParser builderResponseParser;
    private final JsxValidatorService jsxValidatorService;
    private final GenerateJobService generateJobService;
    private final ObjectMapper objectMapper;
    private final PortfolioRepository portfolioRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final PortfolioSectionRepository sectionRepository;

    @Value("${jsx.validator.max-retries:3}")
    private int maxRetries;

    @Override
    public BuilderResponseDTO build(BuilderRequestDTO req, UUID userId) {
        System.out.println(">>> [BUILDER] build() started");
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId required!");

        if (req.getSectionPlans() == null || req.getSectionPlans().isEmpty())
            throw new IllegalArgumentException("sectionPlans required!");
        System.out.println(">>> [BUILDER] Input validation passed");
        System.out.println(">>> [BUILDER] Portfolio ID: " + req.getPortfolioId());
        System.out.println(">>> [BUILDER] Sections count: " + (req.getSections() == null ? 0 : req.getSections().size()));
        System.out.println(">>> [BUILDER] Section plans count: " + req.getSectionPlans().size());
        System.out.println(">>> [BUILDER] Assets count: " + (req.getAssets() == null ? 0 : req.getAssets().size()));

        // Get context from clarifier for constraints
        System.out.println(">>> [BUILDER] Loading clarifier context...");
        ClarifierContext context = clarifierService.getContext(req.getPortfolioId());
        if (context == null)
            throw new IllegalStateException("No clarifier context found. Run clarify first.");
        System.out.println(">>> [BUILDER] Context loaded with turnCount=" + context.getTurnCount()
                + ", confidence=" + context.getConfidenceScore()
                + ", scope=" + context.getScope());

        // Index existing sections
        Map<String, SectionContentDTO> sectionsByKey  = (req.getSections() != null)
                ? req.getSections().stream()
                    .collect(Collectors.toMap(SectionContentDTO::getSectionKey, s -> s))
                : Map.of();

        // Filter the plans that need LLM work
        List<SectionPlanDTO> actionablePlans  = req.getSectionPlans().stream()
                .filter(p -> "modify".equals(p.getAction()) || "add".equals(p.getAction()))
                .toList();

        // Collect section keys marked for deletion
        List<String> deleteKeys = req.getSectionPlans().stream()
                .filter(p -> "delete".equals(p.getAction()))
                .map(SectionPlanDTO::getSectionKey)
                .toList();

        // Create Redis job
        String jobId = generateJobService.createJob(req.getPortfolioId());
        generateJobService.setTotalSections(jobId, actionablePlans.size());

        // Store delete keys in Redis so the barrier worker can handle them at persistence
        if (!deleteKeys.isEmpty()) {
            generateJobService.storeDeleteKeys(jobId, deleteKeys);
        }

        // Build messages and fan out to queue
        List<SectionGenerationMessage> messages = actionablePlans.stream()
                .map(plan -> {
                    SectionGenerationMessage msg = new SectionGenerationMessage();
                    msg.setJobId(jobId);
                    msg.setPortfolioId(req.getPortfolioId().toString());
                    msg.setUserId(userId.toString());
                    msg.setTotalSections(actionablePlans.size());
                    msg.setMode(SectionGenerationMessage.Mode.REFINE);
                    msg.setRefinePlan(plan);
                    msg.setExistingSection(sectionsByKey.get(plan.getSectionKey()));
                    msg.setClarifierContext(context);
                    msg.setAssets(req.getAssets());

                    return msg;
                })
                .toList();

        generateJobService.fanOutSections(messages);

        // Return jobId for status polling
        BuilderResponseDTO response = new BuilderResponseDTO();
        response.setJobId(jobId);
        return response;
    }

    @Override
    public void refineSingleSectionFromQueue(SectionGenerationMessage msg) {
        String sectionKey = msg.getRefinePlan().getSectionKey();
        String jobId = msg.getJobId();
        long sectionStart = System.currentTimeMillis();

        System.out.println(">>> [REFINE-WORKER] Starting section: " + sectionKey + " | job: " + jobId);

        SectionDTO parsedSection = null;
        ValidationResult validation = null;

        int attempt = 0;
        while (attempt < maxRetries) {
            ++attempt;
            System.out.println(">>> [REFINE-WORKER] Section '" + sectionKey + "' attempt " + attempt + "/" + maxRetries);

            // Build prompt (use retry prompt with errors if previous attempt failed validation)
            Prompt sectionPrompt;
            if (validation == null || validation.isValid()) {
                sectionPrompt = builderPromptBuilder.buildSingleSectionPrompt(
                        msg.getClarifierContext(),
                        msg.getExistingSection(),
                        msg.getRefinePlan(),
                        msg.getAssets()
                );
            } else {
                System.out.println(">>> [REFINE-WORKER] Retrying with validation errors (attempt " + attempt + ")");
                sectionPrompt = builderPromptBuilder.buildSingleSectionRetryPrompt(
                        msg.getClarifierContext(),
                        msg.getExistingSection(),
                        msg.getRefinePlan(),
                        msg.getAssets(),
                        validation.getErrors()
                );
            }

            // Call LLM
            long llmStart = System.currentTimeMillis();
            generateJobService.updateStatus(jobId, JobStatusDTO.Status.GENERATING);
            ChatResponse response = openAiChatModel.call(sectionPrompt);
            String rawJson = response.getResult().getOutput().getText();

            System.out.println(">>> [REFINE-WORKER] Section '" + sectionKey + "' LLM call completed in "
                                + (System.currentTimeMillis() - llmStart) + "ms");

            // Parse result
            parsedSection = builderResponseParser.parseSingleRefinedSection(rawJson);

            // Validate
            validation = jsxValidatorService.validateGeneratedSection(parsedSection);

            if (validation.isValid()) {
                System.out.println(">>> [REFINE-WORKER] Section '" + sectionKey + "' validated on attempt " + attempt);
                break;
            }

            System.out.println(">>> [REFINE-WORKER] Section '" + sectionKey + "' validation failed (attempt " + attempt
                    + ")");

        }

        if (validation == null || !validation.isValid()) {
            String failReason = "Failed to generate valid JSX for refined section '"
                    + sectionKey + "' after " + maxRetries + " attempts";
            generateJobService.failJob(jobId, failReason);
            throw new IllegalStateException(failReason);
        }

        // Push completed section to Redis list
        generateJobService.pushCompletedSection(jobId, parsedSection);
        int completedCount = generateJobService.incrementCompleted(jobId);

        System.out.println(">>> [REFINE-WORKER] Section '" + sectionKey + "' completed in "
                + (System.currentTimeMillis() - sectionStart) + "ms (" + completedCount + "/" + msg.getTotalSections()
                + ")");

        // If last worker then persist
        if (completedCount == msg.getTotalSections()) {
            System.out.println(">>> [REFINE-WORKER] All sections complete — triggering persistence | job: " + jobId);
            persistRefinementFromRedis(jobId, msg);
        }
    }

    /**
     * Persist refinement results after all workers complete (barrier).
     *
     * Merges worker-generated sections with unchanged existing sections,
     * handles deletions, creates a new GeneratedVersion, and upserts
     * portfolio_sections.
     *
     * Runs inside the last worker thread, NOT the HTTP request thread.
     */
    private void persistRefinementFromRedis(String jobId, SectionGenerationMessage msg) {
        System.out.println(">>> [REFINE-PERSIST] Starting DB persistence | job: " + jobId);
        long persistStart = System.currentTimeMillis();
        generateJobService.updateStatus(jobId, JobStatusDTO.Status.PERSISTING);

        // 1. Pull all completed (modified/added) sections from Redis
        List<String> sectionsRawJson = generateJobService.getCompletedSections(jobId, 0);
        List<SectionDTO> modifiedSections = sectionsRawJson.stream()
                .map(json -> {
                    try {
                        return objectMapper.readValue(json, SectionDTO.class);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to deserialize refined section", e);
                    }
                })
                .toList();

        System.out.println(">>> [REFINE-PERSIST] Modified sections from Redis: " + modifiedSections.size());
        modifiedSections.forEach(s ->
                System.out.println(">>> [REFINE-PERSIST]   - " + s.getSectionKey()
                        + ": " + (s.getChangeDescription() != null ? s.getChangeDescription() : "no description"))
        );

        // 2. Get delete keys stored at fan-out time
        List<String> deleteKeys = generateJobService.getDeleteKeys(jobId);
        if (!deleteKeys.isEmpty()) {
            System.out.println(">>> [REFINE-PERSIST] Sections to delete: " + deleteKeys);
        }

        // 3. Load portfolio and existing sections from DB
        UUID portfolioId = UUID.fromString(msg.getPortfolioId());
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalStateException("Portfolio not found: " + portfolioId));

        List<PortfolioSection> existingDbSections = sectionRepository.findAllByPortfolioIdOrderByOrderIndexAsc(portfolioId);

        // Index for lookups
        Map<String, SectionDTO> modifiedByKey = modifiedSections.stream()
                .collect(Collectors.toMap(SectionDTO::getSectionKey, s -> s));
        java.util.Set<String> deleteKeySet = new java.util.HashSet<>(deleteKeys);

        // 4. Build merged sections list for the version snapshot
        List<SectionDTO> mergedSections = new ArrayList<>();

        for (PortfolioSection existing : existingDbSections) {
            // Skip deleted sections
            if (deleteKeySet.contains(existing.getSectionKey())) continue;

            SectionDTO modified = modifiedByKey.get(existing.getSectionKey());
            if (modified != null) {
                // Use worker-generated version
                mergedSections.add(modified);
            } else {
                // Keep existing version unchanged
                SectionDTO kept = new SectionDTO();
                kept.setSectionKey(existing.getSectionKey());
                kept.setTitle(existing.getTitle());
                kept.setOrderIndex(existing.getOrderIndex());
                kept.setContentJson(existing.getContentJson());
                kept.setReactSource(existing.getReactSource());
                mergedSections.add(kept);
            }
        }

        // Add brand new sections (action = "add") not in existing DB
        Map<String, PortfolioSection> existingByKey = existingDbSections.stream()
                .collect(Collectors.toMap(PortfolioSection::getSectionKey, s -> s));
        for (SectionDTO modified : modifiedSections) {
            if (!existingByKey.containsKey(modified.getSectionKey())) {
                mergedSections.add(modified);
            }
        }

        // 5. Create GeneratedVersion with merged snapshot
        ObjectNode snapshot = objectMapper.createObjectNode();
        snapshot.set("sections", objectMapper.valueToTree(mergedSections));

        GeneratedVersion version = new GeneratedVersion();
        version.setId(UUID.randomUUID());
        version.setPortfolio(portfolio);
        version.setHtml("");
        version.setPromptUsed(null);
        version.setSectionsSnapshot(snapshot);
        version.setGlobalTheme(null);
        version.setAssistantMessage(null);
        version.setCreatedAt(OffsetDateTime.now());
        generatedVersionRepository.save(version);
        System.out.println(">>> [REFINE-PERSIST] GeneratedVersion saved: " + version.getId());

        // 6. Update portfolio active version
        portfolio.setActiveVersionId(version.getId());
        portfolioRepository.save(portfolio);
        System.out.println(">>> [REFINE-PERSIST] Portfolio active version updated");

        // 7. Delete sections marked for removal
        OffsetDateTime now = OffsetDateTime.now();
        for (String deleteKey : deleteKeys) {
            sectionRepository.findByPortfolioIdAndSectionKey(portfolioId, deleteKey)
                    .ifPresent(section -> {
                        sectionRepository.delete(section);
                        System.out.println(">>> [REFINE-PERSIST] Deleted section: " + deleteKey);
                    });
        }

        // 8. Upsert modified/added sections
        for (SectionDTO sectionDto : modifiedSections) {
            PortfolioSection section = sectionRepository
                    .findByPortfolioIdAndSectionKey(portfolioId, sectionDto.getSectionKey())
                    .orElse(new PortfolioSection());

            if (section.getId() == null) {
                section.setId(UUID.randomUUID());
                section.setPortfolio(portfolio);
                section.setSectionKey(sectionDto.getSectionKey());
                section.setCreatedAt(now);
                section.setSource("ai");
            }
            section.setTitle(sectionDto.getTitle());
            section.setContentJson(sectionDto.getContentJson());
            section.setReactSource(sectionDto.getReactSource());
            section.setOrderIndex(sectionDto.getOrderIndex() != null ? sectionDto.getOrderIndex() : 0);
            section.setUpdatedAt(now);
            sectionRepository.save(section);
        }
        System.out.println(">>> [REFINE-PERSIST] Sections upserted: " + modifiedSections.size());

        generateJobService.updateStatus(jobId, JobStatusDTO.Status.COMPLETED);
        System.out.println(">>> [REFINE-PERSIST] Completed in "
                + (System.currentTimeMillis() - persistStart) + "ms | job: " + jobId);
    }
}
