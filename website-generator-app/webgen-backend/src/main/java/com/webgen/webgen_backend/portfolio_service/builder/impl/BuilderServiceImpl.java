package com.webgen.webgen_backend.portfolio_service.builder.impl;

import com.webgen.webgen_backend.dto.portfolio.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionContentDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionPlanDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio_service.builder.BuilderService;
import com.webgen.webgen_backend.portfolio_service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio_service.job.GenerateJobService;
import com.webgen.webgen_backend.portfolio_service.job.SectionGenerationMessage;
import com.webgen.webgen_backend.portfolio_service.parser.BuilderResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.BuilderPromptBuilder;
import com.webgen.webgen_backend.portfolio_service.validator.JsxValidatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

        // Create Redis job
        String jobId = generateJobService.createJob(req.getPortfolioId());
        generateJobService.setTotalSections(jobId, actionablePlans.size());

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
//
//        BuilderResponseDTO response = null;
//        ValidationResult validation = null;
//        int attempt = 0;
//
//        while (attempt < maxRetries) {
//            attempt++;
//            System.out.println(">>> [BUILDER] Attempt " + attempt + " of " + maxRetries);
//
//            // Build prompt (with errors if retry)
//            Prompt prompt;
//            if (validation == null || validation.isValid()) {
//                System.out.println(">>> [BUILDER] Building primary prompt...");
//                long promptStart = System.currentTimeMillis();
//                prompt = builderPromptBuilder.buildPrompt(
//                        context,
//                        req.getSections(),
//                        req.getSectionPlans(),
//                        req.getAssets()
//                );
//                System.out.println(">>> [BUILDER] Primary prompt built in " + (System.currentTimeMillis() - promptStart) + "ms");
//            } else {
//                System.out.println(">>> Retrying with validation errors (attempt " + attempt + ")");
//                long promptStart = System.currentTimeMillis();
//                prompt = builderPromptBuilder.buildRetryPrompt(
//                        context,
//                        req.getSections(),
//                        req.getSectionPlans(),
//                        req.getAssets(),
//                        validation.getErrors()
//                );
//                System.out.println(">>> [BUILDER] Retry prompt built in " + (System.currentTimeMillis() - promptStart) + "ms");
//            }
//
//            // Call AI model
//            System.out.println(">>> [BUILDER] Calling OpenAI model...");
//            long aiStart = System.currentTimeMillis();
//            ChatResponse aiResponse = openAiChatModel.call(prompt);
//            System.out.println(">>> [BUILDER] OpenAI call completed in " + (System.currentTimeMillis() - aiStart) + "ms");
//            String rawJson = aiResponse.getResult().getOutput().getText();
//            System.out.println(">>> [BUILDER] Raw response length: " + (rawJson == null ? 0 : rawJson.length()) + " chars");
//
//            System.out.println(">>> [BUILDER] Parsing response...");
//            long parseStart = System.currentTimeMillis();
//            response = builderResponseParser.parse(rawJson);
//            System.out.println(">>> [BUILDER] Parse completed in " + (System.currentTimeMillis() - parseStart) + "ms");
//            System.out.println(">>> [BUILDER] Parsed modified sections: " +
//                    (response.getModifiedSections() == null ? 0 : response.getModifiedSections().size()));
//
//            // Validate JSX
//            System.out.println(">>> [BUILDER] Validating JSX...");
//            validation = jsxValidatorService.validateSections(response.getModifiedSections());
//
//            if (validation.isValid()) {
//                System.out.println(">>> JSX validation passed on attempt " + attempt);
//                break; // Success
//            }
//
//            System.out.println(">>> Validation failed (attempt " + attempt + "): " + validation.getErrors());
//        }
//
//        if (!validation.isValid()) {
//            throw new IllegalStateException(
//                    "Failed to generate valid JSX after " + maxRetries + " attempts. Errors: " + validation.getErrors()
//            );
//        }
//
//        // Debug output
//        System.out.println("=== BUILDER RESPONSE ===");
//        System.out.println("Portfolio ID: " + req.getPortfolioId());
//        System.out.println("Build Summary: " + response.getBuildSummary());
//        System.out.println("Modified Sections: " + response.getModifiedSections().size());
//        response.getModifiedSections().forEach(s ->
//                System.out.println("  - " + s.getSectionKey() + ": " + s.getChangeDescription())
//        );
//        System.out.println("========================");
//        System.out.println(">>> [BUILDER] Returning builder response");
//
//        return response;
    }
}
