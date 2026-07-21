package com.webgen.webgen_backend.portfolio.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.portfolio.dto.*;
import com.webgen.webgen_backend.portfolio.dto.common.*;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.portfolio.dto.crud.PortfolioLoadResponseDTO;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.PortfolioSection;
import com.webgen.webgen_backend.portfolio.service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio.service.fallback.FallbackSectionFactory;
import com.webgen.webgen_backend.portfolio.service.job.GenerateJobService;
import com.webgen.webgen_backend.portfolio.service.job.SectionGenerationMessage;
import com.webgen.webgen_backend.portfolio.service.parser.PortfolioResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.PortfolioPromptBuilder;
import com.webgen.webgen_backend.portfolio.service.prompt.PromptRefinerService;
import com.webgen.webgen_backend.portfolio.service.validator.JsxValidatorService;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PortfolioAiServiceImpl implements PortfolioAiService {

    private final ChatModel blueprintModel;
    private final ChatModel sectionModel;
    private final ChatModel sectionRepairModel;

    private final GenerateJobService jobService;

    private final PromptRefinerService promptRefinerService;
    private final PortfolioPromptBuilder portfolioPromptBuilder;
    private final PortfolioResponseParser portfolioResponseParser;

    private final JsxValidatorService jsxValidatorService;
    private final FallbackSectionFactory fallbackSectionFactory;

    private final PortfolioRepository portfolioRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final PortfolioSectionRepository sectionRepository;

    private final ObjectMapper objectMapper;

    @Value("${jsx.validator.max-retries:3}")
    private int maxRetries;

    public PortfolioAiServiceImpl(
            @Qualifier("portfolioBlueprintModel") ChatModel blueprintModel,
            @Qualifier("portfolioSectionModel") ChatModel sectionModel,
            @Qualifier("portfolioSectionRepairModel") ChatModel sectionRepairModel,
            GenerateJobService jobService,
            PromptRefinerService promptRefinerService,
            PortfolioPromptBuilder portfolioPromptBuilder,
            PortfolioResponseParser portfolioResponseParser,
            JsxValidatorService jsxValidatorService,
            FallbackSectionFactory fallbackSectionFactory,
            PortfolioRepository portfolioRepository,
            GeneratedVersionRepository generatedVersionRepository,
            PortfolioSectionRepository sectionRepository,
            ObjectMapper objectMapper) {
        this.blueprintModel = blueprintModel;
        this.sectionModel = sectionModel;
        this.sectionRepairModel = sectionRepairModel;
        this.jobService = jobService;
        this.promptRefinerService = promptRefinerService;
        this.portfolioPromptBuilder = portfolioPromptBuilder;
        this.portfolioResponseParser = portfolioResponseParser;
        this.jsxValidatorService = jsxValidatorService;
        this.fallbackSectionFactory = fallbackSectionFactory;
        this.portfolioRepository = portfolioRepository;
        this.generatedVersionRepository = generatedVersionRepository;
        this.sectionRepository = sectionRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void generatePortfolio(
            UUID portfolioId,
            UUID userId,
            PortfolioGenerateRequestDTO req,
            String jobId,
            UUID creditReservationId) {
        // --- Ownership check
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        // --- Validate and normalize input
        if (req == null || req.getResume() == null) // Require resume for now
            throw new IllegalArgumentException("Resume data required | Req cannot be null");

        // --- Normalize nulls
        ParsedResumeDTO resume = req.getResume();
        if (resume.getSkills() == null)
            resume.setSkills(List.of());
        if (resume.getExperiences() == null)
            resume.setExperiences(List.of());
        if (resume.getProjects() == null)
            resume.setProjects(List.of());
        if (resume.getEducations() == null)
            resume.setEducations(List.of());
        if (resume.getSummary() == null)
            resume.setSummary("");

        // --- Step 1) Refine & Build prompt
        String rawPrompt = req.getUserPrompt();
        long refineStart = System.currentTimeMillis();
        jobService.updateStatus(jobId, JobStatusDTO.Status.REFINING_PROMPT);
        String refinedPrompt = promptRefinerService.refineUserPrompt(rawPrompt, resume, req.getStylePrefs());
        log.debug("Prompt refined jobId={} durationMs={}", jobId, System.currentTimeMillis() - refineStart);

        // --- Step 2) Generate a blueprint
        Prompt blueprintPrompt = portfolioPromptBuilder.buildBlueprintPrompt(req, refinedPrompt);

        // Update, call, parse
        jobService.updateStatus(jobId, JobStatusDTO.Status.GENERATING);
        ChatResponse blueprintResponse = blueprintModel.call(blueprintPrompt);

        String blueprintJson = blueprintResponse.getResult().getOutput().getText();
        BlueprintDTO blueprint = portfolioResponseParser.parseBlueprintResponse(blueprintJson);
        jobService.setTotalSections(jobId, blueprint.getSectionPlan().size());

        log.info("Blueprint generated jobId={} sectionCount={}", jobId, blueprint.getSectionPlan().size());
        if (log.isDebugEnabled()) {
            for (BlueprintSectionPlanDTO plan : blueprint.getSectionPlan()) {
                log.debug("Blueprint section jobId={} order={} key={} title={} layout={} strategy={}",
                        jobId, plan.getOrderIndex(), plan.getSectionKey(), plan.getTitle(),
                        plan.getLayoutHint(), plan.getContentStrategy());
            }
        }

        // --- Step 3) Fan out sections
        List<SectionGenerationMessage> messages = blueprint.getSectionPlan().stream()
                .map(planItem -> {
                    SectionGenerationMessage msg = new SectionGenerationMessage();

                    // Set property fields for one shot generation flow
                    msg.setJobId(jobId);
                    msg.setPortfolioId(portfolioId.toString());
                    msg.setUserId(userId.toString());
                    msg.setCreditReservationId(creditReservationId);
                    msg.setTotalSections(blueprint.getSectionPlan().size());
                    msg.setMode(SectionGenerationMessage.Mode.GENERATE);
                    msg.setReq(req);
                    msg.setRefinedPrompt(refinedPrompt);
                    msg.setBlueprint(blueprint);
                    msg.setPlanItem(planItem);

                    return msg;
                })
                .toList();

        jobService.fanOutSections(messages);
    }

    @Override
    public void generateSingleSectionFromQueue(SectionGenerationMessage msg) {
        String sectionKey = msg.getPlanItem().getSectionKey();
        String jobId = msg.getJobId();
        long sectionStart = System.currentTimeMillis();

        log.debug("Section generation started jobId={} sectionKey={}", jobId, sectionKey);

        SectionDTO parsedSection = null;
        ValidationResult validation = null;
        int attempt = 0;

        // Locked invariants from attempt 1 — retries may only change reactSource
        String lockedSectionKey = null;
        String lockedTitle = null;
        Integer lockedOrderIndex = null;
        com.fasterxml.jackson.databind.JsonNode lockedContentJson = null;

        while (attempt < maxRetries) {
            ++attempt;
            log.debug("Section attempt jobId={} sectionKey={} attempt={}/{}", jobId, sectionKey, attempt, maxRetries);

            // --- Build prompt (use retry prompt with errors if previous attempt failed
            // validation)
            Prompt sectionPrompt;
            if (validation == null || validation.isValid()) {
                sectionPrompt = portfolioPromptBuilder
                        .buildSectionPrompt(msg.getReq(), msg.getRefinedPrompt(), msg.getBlueprint(),
                                msg.getPlanItem());
            } else {
                sectionPrompt = portfolioPromptBuilder
                        .buildSectionRetryPrompt(msg.getReq(), msg.getRefinedPrompt(), msg.getBlueprint(),
                                msg.getPlanItem(), validation.getErrors(), parsedSection.getReactSource(),
                                lockedContentJson);
            }

            // --- Call LLM: first attempt uses creative model, retries use repair model
            boolean isRetry = attempt > 1;
            ChatModel activeModel = isRetry ? sectionRepairModel : sectionModel;
            long llmStart = System.currentTimeMillis();
            jobService.updateStatus(jobId, JobStatusDTO.Status.GENERATING);
            if (isRetry) {
                log.debug("Section using repair model jobId={} sectionKey={} attempt={}", jobId, sectionKey, attempt);
            }
            ChatResponse response = activeModel.call(sectionPrompt);
            String rawJson = response.getResult().getOutput().getText();
            parsedSection = portfolioResponseParser.parseSingleSectionResponse(rawJson);
            log.debug("Section parsed jobId={} sectionKey={} llmMs={} reactSourceChars={}",
                    jobId, sectionKey, System.currentTimeMillis() - llmStart,
                    parsedSection.getReactSource() == null ? 0 : parsedSection.getReactSource().length());

            // --- Lock invariants on first successful parse
            if (lockedSectionKey == null) {
                lockedSectionKey = parsedSection.getSectionKey();
                lockedTitle = parsedSection.getTitle();
                lockedOrderIndex = parsedSection.getOrderIndex();
                lockedContentJson = parsedSection.getContentJson();
                log.debug("Section invariants locked jobId={} sectionKey={} orderIndex={}",
                        jobId, lockedSectionKey, lockedOrderIndex);
            }

            // --- Pre-repair: fix deterministic LLM mistake before validation
            if (parsedSection.getReactSource() != null
                    && parsedSection.getReactSource().contains("data.contentJson.")) {
                String fixed = parsedSection.getReactSource().replace("data.contentJson.", "data.");
                log.debug("Section pre-repair applied jobId={} sectionKey={} fix=data.contentJson->data",
                        jobId, sectionKey);
                parsedSection.setReactSource(fixed);
            }

            // --- Enforce locked invariants on retries: override with attempt-1 values
            if (attempt > 1) {
                if (!lockedSectionKey.equals(parsedSection.getSectionKey())) {
                    log.warn("Section invariant drift reverted jobId={} sectionKey={} field=sectionKey from={} to={}",
                            jobId, sectionKey, lockedSectionKey, parsedSection.getSectionKey());
                }
                if (lockedOrderIndex != null && !lockedOrderIndex.equals(parsedSection.getOrderIndex())) {
                    log.warn("Section invariant drift reverted jobId={} sectionKey={} field=orderIndex from={} to={}",
                            jobId, sectionKey, lockedOrderIndex, parsedSection.getOrderIndex());
                }
                parsedSection.setSectionKey(lockedSectionKey);
                parsedSection.setTitle(lockedTitle);
                parsedSection.setOrderIndex(lockedOrderIndex);
                parsedSection.setContentJson(lockedContentJson);
            }

            // --- Validate
            validation = jsxValidatorService.validateGeneratedSection(parsedSection);

            if (validation.isValid()) {
                log.debug("Section validated jobId={} sectionKey={} attempt={}", jobId, sectionKey, attempt);
                break;
            }

            log.warn("Section validation failed jobId={} sectionKey={} attempt={} errors={}",
                    jobId, sectionKey, attempt, formatValidationErrors(validation, parsedSection.getReactSource()));
        }

        // --- Degrade to a placeholder section instead of failing the whole job:
        // one stubborn section must not destroy every other valid section
        if (validation == null || !validation.isValid()) {
            log.warn("Section failed all attempts, shipping fallback placeholder jobId={} sectionKey={} attempts={} errors={}",
                    jobId, sectionKey, maxRetries,
                    formatValidationErrors(validation, parsedSection == null ? null : parsedSection.getReactSource()));

            SectionDTO fallback = fallbackSectionFactory.createFallbackSection(
                    msg.getPlanItem(), lockedTitle, lockedOrderIndex, lockedContentJson);
            ValidationResult fallbackValidation = jsxValidatorService.validateGeneratedSection(fallback);

            if (!fallbackValidation.isValid()) {
                String failReason = "Failed to generate valid JSX for section '"
                        + sectionKey + "' after " + maxRetries + " attempts, and the fallback section failed validation";
                jobService.failJob(jobId, failReason);
                throw new IllegalStateException(failReason);
            }
            parsedSection = fallback;
        }

        // Push completed section to Redis list
        jobService.pushCompletedSection(jobId, parsedSection);
        int completedCount = jobService.incrementCompleted(jobId);

        log.debug("Section completed jobId={} sectionKey={} durationMs={} progress={}/{}",
                jobId, sectionKey, System.currentTimeMillis() - sectionStart, completedCount, msg.getTotalSections());

        // Persist all sections into one cohesive portfolio if last section was
        // generated
        if (completedCount == msg.getTotalSections()) {
            log.debug("All sections complete, triggering persistence jobId={}", jobId);
            persistFromRedis(jobId, msg.getPortfolioId(), msg.getBlueprint(), msg.getReq());
        }

    }

    private void persistFromRedis(
            String jobId,
            String portfolioId,
            BlueprintDTO blueprint,
            PortfolioGenerateRequestDTO req) {
        long persistStart = System.currentTimeMillis();
        jobService.updateStatus(jobId, JobStatusDTO.Status.PERSISTING);

        // Get all completed sections from the Redis list
        List<String> sectionsRawJson = jobService.getCompletedSections(jobId, 0);
        List<SectionDTO> sections = sectionsRawJson.stream()
                .map(json -> {
                    try {
                        return objectMapper.readValue(json, SectionDTO.class);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to deserialize section", e);
                    }
                })
                .toList();

        // Build PortfolioGenerateResponseDTO and persist
        PortfolioGenerateResponseDTO response = new PortfolioGenerateResponseDTO(
                "",
                sections,
                blueprint.getAssistantMessage(),
                blueprint.getGlobalThemeDTO());

        persistGenerationResults(
                UUID.fromString(portfolioId),
                portfolioRepository.findById(UUID.fromString(portfolioId)).orElseThrow(),
                req,
                response);

        jobService.updateStatus(jobId, JobStatusDTO.Status.COMPLETED);
        log.info("Portfolio persisted jobId={} durationMs={}", jobId, System.currentTimeMillis() - persistStart);
    }

    // /**
    // * Call LLM and generate the react source code for a single section
    // * Update the job status accordingly in redis DB
    // * Validate react source code
    // * @param req Generation request
    // * @param refinedPrompt Refined user prompt
    // * @param blueprint Blueprint of overall portfolio goals
    // * @param planItem Specific section plan blueprint
    // * @param priorSignatures Prior completed sections
    // * @param jobId current job
    // * @return section dto w/ react source code
    // */
    // private SectionDTO generateSingleSection(
    // PortfolioGenerateRequestDTO req,
    // String refinedPrompt,
    // BlueprintDTO blueprint,
    // BlueprintSectionPlanDTO planItem,
    // List<String> priorSignatures,
    // String jobId
    // ) {
    // SectionDTO parsedSection = null;
    // ValidationResult validation = null;
    // int attempt = 0;
    //
    // while (attempt < maxRetries) {
    // attempt++;
    //
    // // --- Build prompt
    // Prompt sectionPrompt = portfolioPromptBuilder
    // .buildSectionPrompt(req, refinedPrompt, blueprint, planItem,
    // priorSignatures);
    //
    // // --- Call LLM
    // jobService.updateStatus(jobId, JobStatusDTO.Status.GENERATING);
    // ChatResponse response = sectionModel.call(sectionPrompt);
    // String rawJson = response.getResult().getOutput().getText();
    //
    // // --- Parse
    // parsedSection = portfolioResponseParser.parseSingleSectionResponse(rawJson);
    //
    // // --- Validate react source code
    // jobService.updateStatus(jobId, JobStatusDTO.Status.VALIDATING);
    // validation =
    // jsxValidatorService.validateGeneratedSections(List.of(parsedSection));
    //
    // if (validation.isValid()) {
    // System.out.println(">>> [SERVICE] Section '" + planItem.getSectionKey()
    // + "' validated on attempt " + attempt);
    // break;
    // }
    //
    // jobService.updateStatus(jobId, JobStatusDTO.Status.RETRYING);
    // System.out.println(">>> [SERVICE] Section '" + planItem.getSectionKey()
    // + "' validation failed (attempt " + attempt + "): " +
    // validation.getErrors());
    // }
    //
    // if (validation == null || !validation.isValid()) {
    // String failReason = "Failed to generate valid JSX for section '"
    // + planItem.getSectionKey() + "' after " + maxRetries + " attempts";
    // jobService.failJob(jobId, failReason);
    // throw new IllegalStateException(failReason);
    // }
    //
    // return parsedSection;
    // }

    private String buildSignature(BlueprintSectionPlanDTO planItem, SectionDTO validSection) {
        return planItem.getSectionKey() + ": " + planItem.getLayoutHint()
                + " | title: " + validSection.getTitle();
    }

    private String formatValidationErrors(ValidationResult validation, String reactSource) {
        if (validation == null || validation.getErrors() == null || validation.getErrors().isEmpty())
            return "none";

        String[] sourceLines = reactSource == null ? new String[0] : reactSource.split("\\R", -1);

        return validation.getErrors().stream()
                .map(error -> {
                    StringBuilder line = new StringBuilder();
                    line.append("- ")
                            .append(error.getMessage() == null ? "Unknown validation error" : error.getMessage())
                            .append(" [line=")
                            .append(error.getLine() == null ? "?" : error.getLine())
                            .append(", col=")
                            .append(error.getColumn() == null ? "?" : error.getColumn())
                            .append("]");

                    if (error.getLine() != null && error.getLine() > 0 && error.getLine() <= sourceLines.length) {
                        String sourceLine = sourceLines[error.getLine() - 1].trim();
                        if (sourceLine.length() > 220)
                            sourceLine = sourceLine.substring(0, 220) + "...";
                        line.append("\n  source: ").append(sourceLine);
                    }

                    return line.toString();
                })
                .collect(Collectors.joining("\n"));
    }

    private void persistGenerationResults(
            UUID portfolioId,
            Portfolio portfolio,
            PortfolioGenerateRequestDTO req,
            PortfolioGenerateResponseDTO response) {
        // --- Insert GeneratedVersion
        ObjectNode snapshot = objectMapper.createObjectNode();
        snapshot.set("sections", objectMapper.valueToTree(response.getSections()));
        snapshot.set("globalTheme", objectMapper.valueToTree(response.getGlobalTheme()));

        GeneratedVersion version = new GeneratedVersion();
        version.setId(UUID.randomUUID());
        version.setPortfolio(portfolio);
        version.setHtml(""); // NOT NULL field, not used (React-based rendering)
        version.setPromptUsed(req.getUserPrompt());
        version.setSectionsSnapshot(snapshot);
        version.setGlobalTheme(objectMapper.valueToTree(response.getGlobalTheme()));
        version.setAssistantMessage(objectMapper.valueToTree(response.getAssistantMessage()));
        version.setCreatedAt(OffsetDateTime.now());
        generatedVersionRepository.save(version);
        log.debug("Generated version saved portfolioId={} versionId={}", portfolioId, version.getId());

        // --- Update portfolio.activeVersionId
        portfolio.setActiveVersionId(version.getId());
        portfolioRepository.save(portfolio);

        // --- Upsert portfolio_sections
        OffsetDateTime now = OffsetDateTime.now();
        for (SectionDTO sectionDto : response.getSections()) {
            PortfolioSection section = sectionRepository
                    .findByPortfolioIdAndSectionKey(portfolioId, sectionDto.getSectionKey())
                    .orElse(new PortfolioSection());

            if (section.getId() == null) { // new section
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
        log.debug("Portfolio sections upserted portfolioId={} count={}", portfolioId, response.getSections().size());
    }

    @Override
    public SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req) {
        return null;
    }

}
