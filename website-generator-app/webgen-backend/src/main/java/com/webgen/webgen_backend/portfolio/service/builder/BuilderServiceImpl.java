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
import com.webgen.webgen_backend.portfolio.service.refine.RefineChatTurnHistoryService;
import com.webgen.webgen_backend.portfolio.service.validator.JsxValidatorService;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.portfolio.exception.RefineSessionExpiredException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class BuilderServiceImpl implements BuilderService {
    private final OpenAiChatModel openAiChatModel; // Uses primary (gpt-5)
    private final ClarifierService clarifierService;
    private final BuilderPromptBuilder builderPromptBuilder;
    private final BuilderResponseParser builderResponseParser;
    private final JsxValidatorService jsxValidatorService;
    private final FallbackSectionFactory fallbackSectionFactory;
    private final PlanConsistencyValidator planConsistencyValidator;
    private final GenerateJobService generateJobService;
    private final ObjectMapper objectMapper;
    private final PortfolioRepository portfolioRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final PortfolioSectionRepository sectionRepository;
    private final PortfolioSectionMapper sectionMapper;
    private final RefineChatTurnHistoryService refineChatTurnHistoryService;

    @Value("${jsx.validator.max-retries:3}")
    private int maxRetries;

    @Override
    public BuilderResponseDTO build(
            BuilderRequestDTO req,
            UUID userId
    ) {
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId required!");

        if (req.getSectionPlans() == null || req.getSectionPlans().isEmpty())
            throw new IllegalArgumentException("sectionPlans required!");

        // Get context from clarifier via sessionId
        if (req.getSessionId() == null || req.getSessionId().isBlank())
            throw new IllegalArgumentException("sessionId required!");
        ClarifierContext context = clarifierService.getContext(req.getSessionId());
        if (context == null)
            throw new RefineSessionExpiredException();
        log.debug("Builder context loaded sessionId={} turnCount={} confidence={} scope={}",
                req.getSessionId(), context.getTurnCount(), context.getConfidenceScore(), context.getScope());

        // Scope enforcement happens at PLAN time (SectionPlanScopeGuard), so the
        // plan the user approved executes verbatim — no filtering here.

        // --- Load current sections from the DB. The DB is the source of truth
        // for section code: a stale browser must never supply what gets modified
        Map<String, SectionContentDTO> sectionsByKey = sectionMapper
                .toSectionContentList(sectionRepository.findAllByPortfolioIdOrderByOrderIndexAsc(req.getPortfolioId()))
                .stream()
                .collect(Collectors.toMap(SectionContentDTO::getSectionKey, s -> s));

        // --- Reject plans that no longer match the persisted sections (409)
        // rather than executing changes against data the plan never saw
        List<SectionPlanDTO> reconciledPlans =
                planConsistencyValidator.reconcile(req.getSectionPlans(), sectionsByKey.keySet());

        // Filter the plans that need LLM work
        List<SectionPlanDTO> actionablePlans = reconciledPlans.stream()
                .filter(p -> "modify".equals(p.getAction()) || "add".equals(p.getAction()))
                .toList();

        // Collect section keys marked for deletion
        List<String> deleteKeys = reconciledPlans.stream()
                .filter(p -> "delete".equals(p.getAction()))
                .map(SectionPlanDTO::getSectionKey)
                .toList();

        // A plan with nothing to build or delete would create a job no worker
        // ever completes, so the barrier would leave it hanging forever
        if (actionablePlans.isEmpty() && deleteKeys.isEmpty())
            throw new IllegalArgumentException("Plan contains no actionable changes");

        // Create Redis job
        long buildStartedAtMillis = System.currentTimeMillis();
        String jobId = generateJobService.createJob(req.getPortfolioId());
        generateJobService.setTotalSections(jobId, actionablePlans.size());

        // Store delete keys in Redis so the barrier worker can handle them at persistence
        if (!deleteKeys.isEmpty()) {
            generateJobService.storeDeleteKeys(jobId, deleteKeys);
        }

        // --- Delete-only plans have no workers to trigger the persistence
        // barrier: persist synchronously and return the already-finished job
        if (actionablePlans.isEmpty()) {
            log.debug("Delete-only refinement, persisting without workers jobId={} deleteSections={}", jobId, deleteKeys.size());
            refineChatTurnHistoryService.recordBuildApproval(userId, req.getPortfolioId());
            persistRefinementFromRedis(jobId, req.getPortfolioId(), userId, buildStartedAtMillis);
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
                    msg.setRefineBuildStartedAtMillis(buildStartedAtMillis);

                    return msg;
                })
                .toList();

        generateJobService.fanOutSections(messages);
        refineChatTurnHistoryService.recordBuildApproval(userId, req.getPortfolioId());

        log.info("Refinement build queued jobId={} portfolioId={} actionableSections={} deleteSections={}",
                jobId, req.getPortfolioId(), actionablePlans.size(), deleteKeys.size());

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

        log.debug("Section refine started jobId={} sectionKey={}", jobId, sectionKey);

        SectionDTO parsedSection = null;
        ValidationResult validation = null;

        int attempt = 0;
        while (attempt < maxRetries) {
            ++attempt;
            log.debug("Section refine attempt jobId={} sectionKey={} attempt={}/{}", jobId, sectionKey, attempt, maxRetries);

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

            log.debug("Section refine call completed jobId={} sectionKey={} llmMs={}",
                    jobId, sectionKey, System.currentTimeMillis() - llmStart);

            // Parse result
            parsedSection = builderResponseParser.parseSingleRefinedSection(rawJson);

            // Validate
            validation = jsxValidatorService.validateGeneratedSection(parsedSection);

            if (validation.isValid()) {
                log.debug("Section refine validated jobId={} sectionKey={} attempt={}", jobId, sectionKey, attempt);
                break;
            }

            log.warn("Section refine validation failed jobId={} sectionKey={} attempt={}", jobId, sectionKey, attempt);

        }

        // --- Degrade instead of failing the whole job: revert to the previous
        // version of the section, or skip entirely when adding a new section
        if (validation == null || !validation.isValid()) {
            SectionContentDTO existing = msg.getExistingSection();
            boolean canRevert = existing != null
                    && existing.getReactSource() != null
                    && !existing.getReactSource().isBlank();

            if (canRevert) {
                log.warn("Section refine failed all attempts, keeping previous version jobId={} sectionKey={} attempts={}",
                        jobId, sectionKey, maxRetries);
                parsedSection = fallbackSectionFactory.createUnchangedSection(existing);
            } else {
                log.warn("New section refine failed all attempts with no previous version, skipping jobId={} sectionKey={} attempts={}",
                        jobId, sectionKey, maxRetries);
                int completedCount = generateJobService.incrementCompleted(jobId);
                if (completedCount == msg.getTotalSections()) {
                    persistRefinementFromRedis(
                            jobId,
                            UUID.fromString(msg.getPortfolioId()),
                            UUID.fromString(msg.getUserId()),
                            buildStartedAtMillis(msg)
                    );
                }
                return;
            }
        }

        // Push completed section to Redis list
        generateJobService.pushCompletedSection(jobId, parsedSection);
        int completedCount = generateJobService.incrementCompleted(jobId);

        log.debug("Section refine completed jobId={} sectionKey={} durationMs={} progress={}/{}",
                jobId, sectionKey, System.currentTimeMillis() - sectionStart, completedCount, msg.getTotalSections());

        // If last worker then persist
        if (completedCount == msg.getTotalSections()) {
            log.debug("All refined sections complete, triggering persistence jobId={}", jobId);
            persistRefinementFromRedis(
                    jobId,
                    UUID.fromString(msg.getPortfolioId()),
                    UUID.fromString(msg.getUserId()),
                    buildStartedAtMillis(msg)
            );
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
    private void persistRefinementFromRedis(
            String jobId,
            UUID portfolioId,
            UUID userId,
            long buildStartedAtMillis
    ) {
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

        // 2. Get delete keys stored at fan-out time
        List<String> deleteKeys = generateJobService.getDeleteKeys(jobId);

        // 3. Load portfolio and existing sections from DB
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalStateException("Portfolio not found: " + portfolioId));

        List<PortfolioSection> existingDbSections = sectionRepository.findAllByPortfolioIdOrderByOrderIndexAsc(portfolioId);

        // 4. Carry forward globalTheme from the previous active version
        com.fasterxml.jackson.databind.JsonNode previousGlobalTheme = null;
        if (portfolio.getActiveVersionId() != null) {
            GeneratedVersion previousVersion = generatedVersionRepository.findById(portfolio.getActiveVersionId())
                    .orElse(null);
            if (previousVersion != null) {
                previousGlobalTheme = previousVersion.getGlobalTheme();
                log.debug("Carrying forward globalTheme from previous version jobId={} previousVersionId={} themePresent={}",
                        jobId, portfolio.getActiveVersionId(), previousGlobalTheme != null);
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
                continue;
            }

            SectionDTO modified = modifiedByKey.get(existing.getSectionKey());
            if (modified != null) {
                mergedSections.add(modified);
            } else {
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

        log.debug("Refinement merge computed jobId={} modified={} deleted={} merged={}",
                jobId, modifiedSections.size(), deleteKeys.size(), mergedSections.size());

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
        log.debug("Refinement version saved jobId={} versionId={} globalThemePreserved={}",
                jobId, version.getId(), previousGlobalTheme != null);

        // 7. Update portfolio active version
        portfolio.setActiveVersionId(version.getId());
        portfolioRepository.save(portfolio);

        // 8. Delete sections marked for removal
        OffsetDateTime now = OffsetDateTime.now();
        for (String deleteKey : deleteKeys) {
            sectionRepository.findByPortfolioIdAndSectionKey(portfolioId, deleteKey)
                    .ifPresent(section -> {
                        sectionRepository.delete(section);
                        log.debug("Deleted section from DB jobId={} sectionKey={}", jobId, deleteKey);
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
        }

        refineChatTurnHistoryService.recordBuildCompletion(
                userId,
                portfolioId,
                fallbackSectionNames(modifiedSections),
                elapsedSeconds(buildStartedAtMillis)
        );

        generateJobService.updateStatus(jobId, JobStatusDTO.Status.COMPLETED);
        log.info("Refinement persisted jobId={} durationMs={}", jobId, System.currentTimeMillis() - persistStart);
    }

    private List<String> fallbackSectionNames(List<SectionDTO> modifiedSections) {
        return modifiedSections.stream()
                .filter(section -> Boolean.TRUE.equals(section.getRefineFallback()))
                .map(section -> section.getTitle() != null && !section.getTitle().isBlank()
                        ? section.getTitle()
                        : section.getSectionKey())
                .toList();
    }

    private long buildStartedAtMillis(SectionGenerationMessage msg) {
        Long startedAtMillis = msg.getRefineBuildStartedAtMillis();
        return startedAtMillis == null ? System.currentTimeMillis() : startedAtMillis;
    }

    private int elapsedSeconds(long startedAtMillis) {
        return Math.max(0, (int) ((System.currentTimeMillis() - startedAtMillis) / 1000));
    }
}
