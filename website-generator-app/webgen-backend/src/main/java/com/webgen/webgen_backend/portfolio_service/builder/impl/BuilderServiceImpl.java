package com.webgen.webgen_backend.portfolio_service.builder.impl;

import com.webgen.webgen_backend.dto.portfolio.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio_service.builder.BuilderService;
import com.webgen.webgen_backend.portfolio_service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio_service.parser.BuilderResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.BuilderPromptBuilder;
import com.webgen.webgen_backend.portfolio_service.validator.JsxValidatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BuilderServiceImpl implements BuilderService {
    private final OpenAiChatModel openAiChatModel; // Uses primary (gpt-5)
    private final ClarifierService clarifierService;
    private final BuilderPromptBuilder builderPromptBuilder;
    private final BuilderResponseParser builderResponseParser;
    private final JsxValidatorService jsxValidatorService;

    @Value("${jsx.validator.max-retries:3}")
    private int maxRetries;

    @Override
    public BuilderResponseDTO build(BuilderRequestDTO req) {
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId required!");

        if (req.getSectionPlans() == null || req.getSectionPlans().isEmpty())
            throw new IllegalArgumentException("sectionPlans required!");

        // Get context from clarifier for constraints
        ClarifierContext context = clarifierService.getContext(req.getPortfolioId());
        if (context == null)
            throw new IllegalStateException("No clarifier context found. Run clarify first.");

        BuilderResponseDTO response = null;
        ValidationResult validation = null;
        int attempt = 0;

        while (attempt < maxRetries) {
            attempt++;

            // Build prompt (with errors if retry)
            Prompt prompt;
            if (validation == null || validation.isValid()) {
                prompt = builderPromptBuilder.buildPrompt(
                        context,
                        req.getSections(),
                        req.getSectionPlans(),
                        req.getAssets()
                );
            } else {
                System.out.println(">>> Retrying with validation errors (attempt " + attempt + ")");
                prompt = builderPromptBuilder.buildRetryPrompt(
                        context,
                        req.getSections(),
                        req.getSectionPlans(),
                        req.getAssets(),
                        validation.getErrors()
                );
            }

            // Call AI model
            ChatResponse aiResponse = openAiChatModel.call(prompt);
            response = builderResponseParser.parse(
                    aiResponse.getResult().getOutput().getText()
            );

            // Validate JSX
            validation = jsxValidatorService.validateSections(response.getModifiedSections());

            if (validation.isValid()) {
                System.out.println(">>> JSX validation passed on attempt " + attempt);
                break; // Success
            }

            System.out.println(">>> Validation failed (attempt " + attempt + "): " + validation.getErrors());
        }

        if (!validation.isValid()) {
            throw new IllegalStateException(
                    "Failed to generate valid JSX after " + maxRetries + " attempts. Errors: " + validation.getErrors()
            );
        }

        // Debug output
        System.out.println("=== BUILDER RESPONSE ===");
        System.out.println("Portfolio ID: " + req.getPortfolioId());
        System.out.println("Build Summary: " + response.getBuildSummary());
        System.out.println("Modified Sections: " + response.getModifiedSections().size());
        response.getModifiedSections().forEach(s ->
                System.out.println("  - " + s.getSectionKey() + ": " + s.getChangeDescription())
        );
        System.out.println("========================");

        return response;
    }
}
