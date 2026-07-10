package com.webgen.webgen_backend.portfolio.service.builder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.portfolio.dto.JobStatusDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionContentDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.mapper.PortfolioSectionMapper;
import com.webgen.webgen_backend.portfolio.service.fallback.FallbackSectionFactory;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.PortfolioSection;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.service.builder.BuilderService;
import com.webgen.webgen_backend.portfolio.service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio.service.job.GenerateJobService;
import com.webgen.webgen_backend.portfolio.service.job.SectionGenerationMessage;
import com.webgen.webgen_backend.portfolio.service.parser.BuilderResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.BuilderPromptBuilder;
import com.webgen.webgen_backend.portfolio.service.validator.JsxValidatorService;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.portfolio.exception.RefineSessionExpiredException;
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
    private final FallbackSectionFactory fallbackSectionFactory;
    private final GenerateJobService generateJobService;
    private final ObjectMapper objectMapper;
    private final PortfolioRepository portfolioRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final PortfolioSectionRepository sectionRepository;
    private final PortfolioSectionMapper sectionMapper;

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
        System.out.println(">>> [BUILDER] Section plans count: " + req.getSectionPlans().size());
        System.out.println(">>> [BUILDER] Assets count: " + (req.getAssets() == null ? 0 : req.getAssets().size()));

        // Get context from clarifier via sessionId
        if (req.getSessionId() == null || req.getSessionId().isBlank())
            throw new IllegalArgumentException("sessionId required!");
        System.out.println(">>> [BUILDER] Loading clarifier context for session: " + req.getSessionId());
        ClarifierContext context = clarifierService.getContext(req.getSessionId());
        if (context == null)
            throw new RefineSessionExpiredException();
        System.out.println(">>> [BUILDER] Context loaded with turnCount=" + context.getTurnCount()
                + ", confidence=" + context.getConfidenceScore()
                + ", scope=" + context.getScope());

        // Scope enforcement happens at PLAN time (SectionPlanScopeGuard), so the
        // plan the user approved executes verbatim — no filtering here.

        // --- Load current sections from the DB. The DB is the source of truth
        // for section code: a stale browser must never supply what gets modified
        Map<String, SectionContentDTO> sectionsByKey = sectionMapper
                .toSectionContentList(sectionRepository.findAllByPortfolioIdOrderByOrderIndexAsc(req.getPortfolioId()))
                .stream()
                .collect(Collectors.toMap(SectionContentDTO::getSectionKey, s -> s));
        System.out.println(">>> [BUILDER] Loaded " + sectionsByKey.size() + " existing sections from DB");

        // Filter the plans that need LLM work
        List<SectionPlanDTO> actionablePlans  = req.getSectionPlans().stream()
                .filter(p -> "modify".equals(p.getAction()) || "add".equals(p.getAction()))
                .toList();

        // Collect section keys marked for deletion
        List<String> deleteKeys = req.getSectionPlans().stream()
                .filter(p -> "delete".equals(p.getAction()))
                .map(SectionPlanDTO::getSectionKey)
                .toList();

        // A plan with nothing to build or delete would create a job no worker
        // ever completes, so the barrier would leave it hanging forever
        if (actionablePlans.isEmpty() && deleteKeys.isEmpty())
            throw new IllegalArgumentException("Plan contains no actionable changes");

        // Create Redis job
        String jobId = generateJobService.createJob(req.getPortfolioId());
        generateJobService.setTotalSections(jobId, actionablePlans.size());

        // Store delete keys in Redis so the barrier worker can handle them at persistence
        if (!deleteKeys.isEmpty()) {
            generateJobService.storeDeleteKeys(jobId, deleteKeys);
        }

        // --- Delete-only plans have no workers to trigger the persistence
        // barrier: persist synchronously and return the already-finished job
        if (actionablePlans.isEmpty()) {
            System.out.println(">>> [BUILDER] Delete-only plan — persisting without workers | job: " + jobId);
            persistRefinementFromRedis(jobId, req.getPortfolioId());
            BuilderResponseDTO response = new BuilderResponseDTO();
            response.setJobId(jobId);
            return response;
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

        // No explicit context reset needed — TTL handles cleanup,
        // and each new refinement gets a fresh sessionId

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

        // --- Degrade instead of failing the whole job: revert to the previous
        // version of the section, or skip entirely when adding a new section
        if (validation == null || !validation.isValid()) {
            SectionContentDTO existing = msg.getExistingSection();
            boolean canRevert = existing != null
                    && existing.getReactSource() != null
                    && !existing.getReactSource().isBlank();

            if (canRevert) {
                System.err.println(">>> [REFINE-WORKER] Section '" + sectionKey + "' failed all "
                        + maxRetries + " attempts — keeping previous version unchanged");
                parsedSection = fallbackSectionFactory.createUnchangedSection(existing);
            } else {
                System.err.println(">>> [REFINE-WORKER] New section '" + sectionKey + "' failed all "
                        + maxRetries + " attempts with no previous version — skipping it");
                int completedCount = generateJobService.incrementCompleted(jobId);
                if (completedCount == msg.getTotalSections()) {
                    persistRefinementFromRedis(jobId, UUID.fromString(msg.getPortfolioId()));
                }
                return;
            }
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
            persistRefinementFromRedis(jobId, UUID.fromString(msg.getPortfolioId()));
        }
    }

    /**
     * Persist refinement results once all LLM work for the job is done.
     *
     * Merges worker-generated sections with unchanged existing sections,
     * handles deletions, creates a new GeneratedVersion, and upserts
     * portfolio_sections.
     *
     * Runs inside the last worker thread as a barrier, except for delete-only
     * plans, which have no workers and persist on the HTTP request thread.
     */
    private void persistRefinementFromRedis(String jobId, UUID portfolioId) {
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
                System.out.println(">>> [REFINE-PERSIST]   [MODIFIED] " + s.getSectionKey()
                        + " | title: " + s.getTitle()
                        + " | change: " + (s.getChangeDescription() != null ? s.getChangeDescription() : "no description"))
        );

        // 2. Get delete keys stored at fan-out time
        List<String> deleteKeys = generateJobService.getDeleteKeys(jobId);
        System.out.println(">>> [REFINE-PERSIST] Sections to delete: " + (deleteKeys.isEmpty() ? "none" : deleteKeys));

        // 3. Load portfolio and existing sections from DB
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalStateException("Portfolio not found: " + portfolioId));

        List<PortfolioSection> existingDbSections = sectionRepository.findAllByPortfolioIdOrderByOrderIndexAsc(portfolioId);
        System.out.println(">>> [REFINE-PERSIST] Existing DB sections: " + existingDbSections.size());
        existingDbSections.forEach(s ->
                System.out.println(">>> [REFINE-PERSIST]   [DB] " + s.getSectionKey() + " | title: " + s.getTitle())
        );

        // 4. Carry forward globalTheme from the previous active version
        com.fasterxml.jackson.databind.JsonNode previousGlobalTheme = null;
        if (portfolio.getActiveVersionId() != null) {
            GeneratedVersion previousVersion = generatedVersionRepository.findById(portfolio.getActiveVersionId())
                    .orElse(null);
            if (previousVersion != null) {
                previousGlobalTheme = previousVersion.getGlobalTheme();
                System.out.println(">>> [REFINE-PERSIST] Carrying forward globalTheme from previous version: "
                        + portfolio.getActiveVersionId()
                        + " | theme: " + (previousGlobalTheme != null ? "present" : "null"));
            }
        }

        // Index for lookups
        Map<String, SectionDTO> modifiedByKey = modifiedSections.stream()
                .collect(Collectors.toMap(SectionDTO::getSectionKey, s -> s));
        java.util.Set<String> deleteKeySet = new java.util.HashSet<>(deleteKeys);

        // 5. Build merged sections list for the version snapshot
        List<SectionDTO> mergedSections = new ArrayList<>();

        for (PortfolioSection existing : existingDbSections) {
            if (deleteKeySet.contains(existing.getSectionKey())) {
                System.out.println(">>> [REFINE-PERSIST]   [SKIP-DELETE] " + existing.getSectionKey());
                continue;
            }

            SectionDTO modified = modifiedByKey.get(existing.getSectionKey());
            if (modified != null) {
                System.out.println(">>> [REFINE-PERSIST]   [MERGE-MODIFIED] " + existing.getSectionKey());
                mergedSections.add(modified);
            } else {
                System.out.println(">>> [REFINE-PERSIST]   [MERGE-KEPT] " + existing.getSectionKey());
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
                System.out.println(">>> [REFINE-PERSIST]   [MERGE-NEW] " + modified.getSectionKey());
                mergedSections.add(modified);
            }
        }

        System.out.println(">>> [REFINE-PERSIST] Final merged sections: " + mergedSections.size());
        mergedSections.forEach(s ->
                System.out.println(">>> [REFINE-PERSIST]   [FINAL] " + s.getSectionKey() + " | title: " + s.getTitle())
        );

        // 6. Create GeneratedVersion with merged snapshot
        ObjectNode snapshot = objectMapper.createObjectNode();
        snapshot.set("sections", objectMapper.valueToTree(mergedSections));
        if (previousGlobalTheme != null) {
            snapshot.set("globalTheme", previousGlobalTheme);
        }

        GeneratedVersion version = new GeneratedVersion();
        version.setId(UUID.randomUUID());
        version.setPortfolio(portfolio);
        version.setHtml("");
        version.setPromptUsed(null);
        version.setSectionsSnapshot(snapshot);
        version.setGlobalTheme(previousGlobalTheme);
        version.setAssistantMessage(null);
        version.setCreatedAt(OffsetDateTime.now());
        generatedVersionRepository.save(version);
        System.out.println(">>> [REFINE-PERSIST] GeneratedVersion saved: " + version.getId()
                + " | globalTheme: " + (previousGlobalTheme != null ? "preserved" : "null"));

        // 7. Update portfolio active version
        portfolio.setActiveVersionId(version.getId());
        portfolioRepository.save(portfolio);
        System.out.println(">>> [REFINE-PERSIST] Portfolio active version updated to: " + version.getId());

        // 8. Delete sections marked for removal
        OffsetDateTime now = OffsetDateTime.now();
        for (String deleteKey : deleteKeys) {
            sectionRepository.findByPortfolioIdAndSectionKey(portfolioId, deleteKey)
                    .ifPresent(section -> {
                        sectionRepository.delete(section);
                        System.out.println(">>> [REFINE-PERSIST] Deleted section from DB: " + deleteKey);
                    });
        }

        // 9. Upsert modified/added sections
        for (SectionDTO sectionDto : modifiedSections) {
            PortfolioSection section = sectionRepository
                    .findByPortfolioIdAndSectionKey(portfolioId, sectionDto.getSectionKey())
                    .orElse(new PortfolioSection());

            boolean isNew = section.getId() == null;
            if (isNew) {
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
            System.out.println(">>> [REFINE-PERSIST]   [UPSERT] " + sectionDto.getSectionKey()
                    + " | " + (isNew ? "INSERT" : "UPDATE"));
        }
        System.out.println(">>> [REFINE-PERSIST] Sections upserted: " + modifiedSections.size());

        generateJobService.updateStatus(jobId, JobStatusDTO.Status.COMPLETED);
        System.out.println(">>> [REFINE-PERSIST] Completed in "
                + (System.currentTimeMillis() - persistStart) + "ms | job: " + jobId);
    }
}
