package com.webgen.webgen_backend.portfolio_service.impl;

import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionRefineRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionRefineResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio_service.parser.PortfolioResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.PortfolioPromptBuilder;
import com.webgen.webgen_backend.portfolio_service.prompt.PromptRefinerService;
import com.webgen.webgen_backend.portfolio_service.validator.JsxValidatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class PortfolioAiServiceImpl implements PortfolioAiService {

    private final OpenAiChatModel openAiChatModel; // Create ai chat model (generate response)

    private final PromptRefinerService promptRefinerService; // Refine prompts
    private final PortfolioPromptBuilder portfolioPromptBuilder; // Build user prompt

    private final PortfolioResponseParser portfolioResponseParser;
    private final JsxValidatorService jsxValidatorService;

    @Value("${jsx.validator.max-retries:3}")
    private int maxRetries;



    @Override
    public PortfolioGenerateResponseDTO generatePortfolio(PortfolioGenerateRequestDTO req) {
        System.out.println(">>> [SERVICE] generatePortfolio() started");

        // --- Validate and normalize input
        if (req == null || req.getResume() == null) // Require resume for now
            throw new IllegalArgumentException("Resume data required | Req cannot be null");

        System.out.println(">>> [SERVICE] Input validation passed");

        // --- Normalize nulls
        ParsedResumeDTO resume = req.getResume();
        if (resume.getSkills() == null) resume.setSkills(List.of());
        if (resume.getExperiences() == null) resume.setExperiences(List.of());
        if (resume.getProjects() == null) resume.setProjects(List.of());
        if (resume.getEducations() == null) resume.setEducations(List.of());
        if (resume.getSummary() == null) resume.setSummary("");

        // --- Refine & Build prompt
        String rawPrompt = req.getUserPrompt();
        System.out.println(">>> [SERVICE] Raw prompt: " + rawPrompt);
        System.out.println(">>> [SERVICE] Calling promptRefinerService.refineUserPrompt()...");

        long refineStart = System.currentTimeMillis();
        String refinedPrompt = promptRefinerService.refineUserPrompt(rawPrompt, resume, req.getStylePrefs());
        System.out.println(">>> [SERVICE] Prompt refined in " + (System.currentTimeMillis() - refineStart) + "ms");
        System.out.println(">>> [SERVICE] Refined prompt: " + refinedPrompt);

        PortfolioGenerateResponseDTO parsedResponse = null;
        ValidationResult validation = null;
        String rawJson = null;
        int attempt = 0;

        while (attempt < maxRetries) {
            attempt++;

            // --- Build prompt (with errors if retry)
            Prompt prompt;
            if (validation == null || validation.isValid()) {
                System.out.println(">>> [SERVICE] Building one-shot prompt...");
                prompt = portfolioPromptBuilder.buildOneShotPrompt(req, refinedPrompt);
            } else {
                System.out.println(">>> [SERVICE] Building retry prompt (attempt " + attempt + ")...");
                prompt = portfolioPromptBuilder.buildOneShotRetryPrompt(req, refinedPrompt, rawJson, validation.getErrors());
            }
            System.out.println(">>> [SERVICE] Prompt built successfully");

            // --- Call AI chat model
            System.out.println(">>> [SERVICE] Calling OpenAI chat model...");
            System.out.println(">>> [SERVICE] WARNING: This may take 30-120 seconds for large portfolios");
            long aiStart = System.currentTimeMillis();

            ChatResponse response = openAiChatModel.call(prompt);

            System.out.println(">>> [SERVICE] OpenAI call completed in " + (System.currentTimeMillis() - aiStart) + "ms");

            rawJson = response.getResult().getOutput().getText();
            System.out.println(">>> [SERVICE] Raw JSON response length: " + (rawJson != null ? rawJson.length() : 0) + " chars");

            // --- Parse json and validate structure
            System.out.println(">>> [SERVICE] Parsing response JSON...");
            parsedResponse = portfolioResponseParser.parseGenerateResponse(rawJson);
            System.out.println(">>> [SERVICE] Response parsed, sections: " + (parsedResponse.getSections() != null ? parsedResponse.getSections().size() : 0));

            System.out.println(">>> [SERVICE] Validating response structure...");
            portfolioResponseParser.validateGenerateResponse(parsedResponse);
            System.out.println(">>> [SERVICE] Structure validation passed");

            // --- Validate JSX
            System.out.println(">>> [SERVICE] Validating JSX...");
            validation = jsxValidatorService.validateGeneratedSections(parsedResponse.getSections());

            if (validation.isValid()) {
                System.out.println(">>> [SERVICE] JSX validation passed on attempt " + attempt);
                break; // Success
            }

            System.out.println(">>> [SERVICE] JSX validation failed (attempt " + attempt + "): " + validation.getErrors());
        }

        if (!validation.isValid()) {
            throw new IllegalStateException(
                    "Failed to generate valid JSX after " + maxRetries + " attempts. Errors: " + validation.getErrors()
            );
        }

        System.out.println(">>> [SERVICE] Validation passed, returning response");
        return parsedResponse;
    }

    @Override
    public SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req) {
        return null;
    }



}
