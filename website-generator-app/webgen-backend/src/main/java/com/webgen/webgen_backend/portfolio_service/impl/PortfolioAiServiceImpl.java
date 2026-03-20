package com.webgen.webgen_backend.portfolio_service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.dto.portfolio.*;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioLoadResponseDTO;
import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.entity.GeneratedVersion;
import com.webgen.webgen_backend.entity.Portfolio;
import com.webgen.webgen_backend.entity.PortfolioSection;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio_service.job.GenerateJobService;
import com.webgen.webgen_backend.portfolio_service.job.SectionGenerationMessage;
import com.webgen.webgen_backend.portfolio_service.parser.PortfolioResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.PortfolioPromptBuilder;
import com.webgen.webgen_backend.portfolio_service.prompt.PromptRefinerService;
import com.webgen.webgen_backend.portfolio_service.validator.JsxValidatorService;
import com.webgen.webgen_backend.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.repository.PortfolioRepository;
import com.webgen.webgen_backend.repository.PortfolioSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioAiServiceImpl implements PortfolioAiService {

    private final OpenAiChatModel openAiChatModel; // Create ai chat model (generate response)

    private final GenerateJobService jobService;

    private final PromptRefinerService promptRefinerService; // Refine prompts
    private final PortfolioPromptBuilder portfolioPromptBuilder; // Build user prompt
    private final PortfolioResponseParser portfolioResponseParser; // Parse AI output

    private final JsxValidatorService jsxValidatorService;

    // DB Persistence
    private final PortfolioRepository portfolioRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final PortfolioSectionRepository sectionRepository;

    private final ObjectMapper objectMapper;

    @Value("${jsx.validator.max-retries:3}")
    private int maxRetries;

    @Override
    public void generatePortfolio(
            UUID portfolioId,
            UUID userId,
            PortfolioGenerateRequestDTO req,
            String jobId) {
        System.out.println(">>> [SERVICE] generatePortfolio() started");

        // --- Ownership check
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        // --- Validate and normalize input
        if (req == null || req.getResume() == null) // Require resume for now
            throw new IllegalArgumentException("Resume data required | Req cannot be null");

        System.out.println(">>> [SERVICE] Input validation passed");

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
        System.out.println(">>> [SERVICE] Raw prompt: " + rawPrompt);
        System.out.println(">>> [SERVICE] Calling promptRefinerService.refineUserPrompt()...");

        long refineStart = System.currentTimeMillis();
        jobService.updateStatus(jobId, JobStatusDTO.Status.REFINING_PROMPT);
        String refinedPrompt = promptRefinerService.refineUserPrompt(rawPrompt, resume, req.getStylePrefs());

        System.out.println(">>> [SERVICE] Prompt refined in " + (System.currentTimeMillis() - refineStart) + "ms");
        System.out.println(">>> [SERVICE] Refined prompt: " + refinedPrompt);

        // --- Step 2) Generate a blueprint
        System.out.println(">>> [SERVICE] Buiilding blueprint prompt...");
        Prompt blueprintPrompt = portfolioPromptBuilder.buildBlueprintPrompt(req, refinedPrompt);

        // Update, call, parse
        jobService.updateStatus(jobId, JobStatusDTO.Status.GENERATING);
        ChatResponse blueprintResponse = openAiChatModel.call(blueprintPrompt);

        String blueprintJson = blueprintResponse.getResult().getOutput().getText();
        BlueprintDTO blueprint = portfolioResponseParser.parseBlueprintResponse(blueprintJson);
        jobService.setTotalSections(jobId, blueprint.getSectionPlan().size());

        // --- Step 3) Fan out sections
        jobService.fanOutSections(
                jobId, portfolioId.toString(), userId.toString(),
                req, refinedPrompt, blueprint
        );
        
    }


    @Override
    public void generateSingleSectionFromQueue(SectionGenerationMessage msg) {
        SectionDTO parsedSection = null;
        ValidationResult validation = null;
        int attempt = 0;

        while (attempt < maxRetries)  {
            ++attempt;

            // --- Build prompt
            Prompt sectionPrompt = portfolioPromptBuilder
                    .buildSectionPrompt(msg.getReq(), msg.getRefinedPrompt(), msg.getBlueprint(), msg.getPlanItem());

            // --- Call and parse LLM
            jobService.updateStatus(msg.getJobId(), JobStatusDTO.Status.GENERATING);
            ChatResponse response = openAiChatModel.call(sectionPrompt);
            String rawJson = response.getResult().getOutput().getText();
            parsedSection = portfolioResponseParser.parseSingleSectionResponse(rawJson);

            // --- Validate
            validation = jsxValidatorService.validateGeneratedSection(parsedSection);

            if (validation.isValid()) break;
        }

        if (validation == null || !validation.isValid()) {
            String failReason = "Failed to generate valid JSX for section '"
                    + msg.getPlanItem().getSectionKey() + "' after " + maxRetries + " attempts";
            jobService.failJob(msg.getJobId(), failReason);
            throw new IllegalStateException(failReason);
        }

        // Push completed section to Redist list
        jobService.pushCompletedSection(msg.getJobId(), parsedSection);
        int completedCount = jobService.incrementCompleted(msg.getJobId());

        // Check if last section was generated
        if (completedCount == msg.getTotalSections())
            persistFromRedis(msg.getJobId(), msg.getPortfolioId(), msg.getBlueprint(), msg.getReq());

    }

    private void persistFromRedis(
            String jobId,
            String portfolioId,
            BlueprintDTO blueprint,
            PortfolioGenerateRequestDTO req
    ) {
        jobService.updateStatus(jobId, JobStatusDTO.Status.PERSISTING);

        // Get all completed sections from the Redist list
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
                blueprint.getGlobalThemeDTO()
        );

        persistGenerationResults(
                UUID.fromString(portfolioId),
                portfolioRepository.findById(UUID.fromString(portfolioId)).orElseThrow(),
                 req,
                response
        );

        jobService.updateStatus(jobId, JobStatusDTO.Status.COMPLETED);
    }


//    /**
//     * Call LLM and generate the react source code for a single section
//     * Update the job status accordingly in redis DB
//     * Validate react source code
//     * @param req Generation request
//     * @param refinedPrompt Refined user prompt
//     * @param blueprint Blueprint of overall portfolio goals
//     * @param planItem Specific section plan blueprint
//     * @param priorSignatures Prior completed sections
//     * @param jobId current job
//     * @return section dto w/ react source code
//     */
//    private SectionDTO generateSingleSection(
//            PortfolioGenerateRequestDTO req,
//            String refinedPrompt,
//            BlueprintDTO blueprint,
//            BlueprintSectionPlanDTO planItem,
//            List<String> priorSignatures,
//            String jobId
//    ) {
//        SectionDTO parsedSection = null;
//        ValidationResult validation = null;
//        int attempt = 0;
//
//        while (attempt < maxRetries) {
//            attempt++;
//
//            // --- Build prompt
//            Prompt sectionPrompt = portfolioPromptBuilder
//                    .buildSectionPrompt(req, refinedPrompt, blueprint, planItem, priorSignatures);
//
//            // --- Call LLM
//            jobService.updateStatus(jobId, JobStatusDTO.Status.GENERATING);
//            ChatResponse response = openAiChatModel.call(sectionPrompt);
//            String rawJson = response.getResult().getOutput().getText();
//
//            // --- Parse
//            parsedSection = portfolioResponseParser.parseSingleSectionResponse(rawJson);
//
//            // --- Validate react source code
//            jobService.updateStatus(jobId, JobStatusDTO.Status.VALIDATING);
//            validation = jsxValidatorService.validateGeneratedSections(List.of(parsedSection));
//
//            if (validation.isValid()) {
//                System.out.println(">>> [SERVICE] Section  '" + planItem.getSectionKey()
//                        + "' validated on attempt " + attempt);
//                break;
//            }
//
//            jobService.updateStatus(jobId, JobStatusDTO.Status.RETRYING);
//            System.out.println(">>> [SERVICE] Section '" + planItem.getSectionKey()
//                    + "' validation failed (attempt " + attempt + "): " + validation.getErrors());
//        }
//
//        if (validation == null || !validation.isValid()) {
//            String failReason = "Failed to generate valid JSX for section '"
//                    + planItem.getSectionKey() + "' after " + maxRetries + " attempts";
//            jobService.failJob(jobId, failReason);
//            throw new IllegalStateException(failReason);
//        }
//
//        return parsedSection;
//    }

    private String buildSignature(BlueprintSectionPlanDTO planItem, SectionDTO validSection) {
        return planItem.getSectionKey() + ": " + planItem.getLayoutHint()
                + " | title: " + validSection.getTitle();
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
        System.out.println(">>> [SERVICE] GeneratedVersion saved: " + version.getId());

        // --- Update portfolio.activeVersionId
        portfolio.setActiveVersionId(version.getId());
        portfolioRepository.save(portfolio);
        System.out.println(">>> [SERVICE] Portfolio active version updated");

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
        System.out.println(">>> [SERVICE] Portfolio sections upserted: " + response.getSections().size());
    }

    @Override
    public SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req) {
        return null;
    }

}
