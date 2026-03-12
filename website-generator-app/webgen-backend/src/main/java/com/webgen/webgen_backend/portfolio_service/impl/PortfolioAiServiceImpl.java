package com.webgen.webgen_backend.portfolio_service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.dto.portfolio.*;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.entity.GeneratedVersion;
import com.webgen.webgen_backend.entity.Portfolio;
import com.webgen.webgen_backend.entity.PortfolioSection;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio_service.job.GenerateJobService;
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
    public PortfolioGenerateResponseDTO generatePortfolio(
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

        // --- Refine & Build prompt
        String rawPrompt = req.getUserPrompt();
        System.out.println(">>> [SERVICE] Raw prompt: " + rawPrompt);
        System.out.println(">>> [SERVICE] Calling promptRefinerService.refineUserPrompt()...");

        long refineStart = System.currentTimeMillis();
        jobService.updateStatus(jobId, JobStatusDTO.Status.REFINING_PROMPT);
        String refinedPrompt = promptRefinerService.refineUserPrompt(rawPrompt, resume, req.getStylePrefs());

        System.out.println(">>> [SERVICE] Prompt refined in " + (System.currentTimeMillis() - refineStart) + "ms");
        System.out.println(">>> [SERVICE] Refined prompt: " + refinedPrompt);

        PortfolioGenerateResponseDTO parsedResponse = null;
        ValidationResult validation = null;
        String rawJson = null;
        int attempt = 0;

        // --- Keep retrying
        while (attempt < maxRetries) {
            attempt++;

            // --- Build prompt (with errors if retry)
            Prompt prompt;
            if (validation == null || validation.isValid()) {
                System.out.println(">>> [SERVICE] Building one-shot prompt...");
                prompt = portfolioPromptBuilder.buildOneShotPrompt(req, refinedPrompt);
            } else {
                System.out.println(">>> [SERVICE] Building retry prompt (attempt " + attempt + ")...");
                prompt = portfolioPromptBuilder.buildOneShotRetryPrompt(req, refinedPrompt, rawJson,
                        validation.getErrors());
            }
            System.out.println(">>> [SERVICE] Prompt built successfully");

            // --- Call AI chat model
            System.out.println(">>> [SERVICE] Calling OpenAI chat model...");
            System.out.println(">>> [SERVICE] WARNING: This may take 30-120 seconds for large portfolios");
            long aiStart = System.currentTimeMillis();

            jobService.updateStatus(jobId, JobStatusDTO.Status.GENERATING);
            ChatResponse response = openAiChatModel.call(prompt);

            System.out
                    .println(">>> [SERVICE] OpenAI call completed in " + (System.currentTimeMillis() - aiStart) + "ms");

            rawJson = response.getResult().getOutput().getText();
            System.out.println(
                    ">>> [SERVICE] Raw JSON response length: " + (rawJson != null ? rawJson.length() : 0) + " chars");

            // --- Parse json and validate structure
            System.out.println(">>> [SERVICE] Parsing response JSON...");
            parsedResponse = portfolioResponseParser.parseGenerateResponse(rawJson);
            System.out.println(">>> [SERVICE] Response parsed, sections: "
                    + (parsedResponse.getSections() != null ? parsedResponse.getSections().size() : 0));

            System.out.println(">>> [SERVICE] Validating response structure...");
            portfolioResponseParser.validateGenerateResponse(parsedResponse);
            System.out.println(">>> [SERVICE] Structure validation passed");

            // --- Validate JSX
            System.out.println(">>> [SERVICE] Validating JSX...");
            jobService.updateStatus(jobId, JobStatusDTO.Status.VALIDATING);
            validation = jsxValidatorService.validateGeneratedSections(parsedResponse.getSections());

            if (validation.isValid()) {
                System.out.println(">>> [SERVICE] JSX validation passed on attempt " + attempt);
                break; // Success
            }

            jobService.updateStatus(jobId, JobStatusDTO.Status.RETRYING);
            System.out.println(
                    ">>> [SERVICE] JSX validation failed (attempt " + attempt + "): " + validation.getErrors());
        }

        if (!validation.isValid()) {
            String failReason = "Failed to generate valid JSX after " + maxRetries + " attempts. Errors: "
                    + validation.getErrors();
            jobService.failJob(jobId, failReason);
            throw new IllegalStateException(failReason);
        }

        System.out.println(">>> [SERVICE] Validation passed, persisting to database...");
        jobService.updateStatus(jobId, JobStatusDTO.Status.PERSISTING);
        persistGenerationResults(portfolioId, portfolio, req, parsedResponse);

        return parsedResponse;
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
