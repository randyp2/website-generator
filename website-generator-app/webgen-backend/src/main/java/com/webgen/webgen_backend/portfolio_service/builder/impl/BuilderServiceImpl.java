package com.webgen.webgen_backend.portfolio_service.builder.impl;

import com.webgen.webgen_backend.dto.portfolio.JobStatusDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionDTO;
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


}
