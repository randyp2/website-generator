package com.webgen.webgen_backend.portfolio_service.planner.impl;

import com.webgen.webgen_backend.dto.portfolio.planner.PlannerRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio_service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio_service.parser.PlannerResponseParser;
import com.webgen.webgen_backend.portfolio_service.planner.PlannerService;
import com.webgen.webgen_backend.portfolio_service.prompt.PlannerPromptBuilder;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlannerServiceImpl implements PlannerService {
    @Resource(name = "plannerModel")
    private OpenAiChatModel openAiChatModel;

    private final ClarifierService clarifierService;
    private final PlannerPromptBuilder plannerPromptBuilder;
    private final PlannerResponseParser plannerResponseParser;

    @Override
    public PlannerResponseDTO plan(PlannerRequestDTO req) {
        System.out.println(">>> [PLANNER] plan() started");
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId required!");
        System.out.println(">>> [PLANNER] Input validation passed");
        System.out.println(">>> [PLANNER] Portfolio ID: " + req.getPortfolioId());
        System.out.println(">>> [PLANNER] Sections count: " + (req.getSections() == null ? 0 : req.getSections().size()));
        System.out.println(">>> [PLANNER] Assets count: " + (req.getAssets() == null ? 0 : req.getAssets().size()));

        // Get context from clarifier
        System.out.println(">>> [PLANNER] Loading clarifier context...");
        ClarifierContext context = clarifierService.getContext(req.getPortfolioId());
        if (context == null)
            throw new IllegalStateException("No clarifier context found. Run clarify first.");
        System.out.println(">>> [PLANNER] Context loaded with turnCount=" + context.getTurnCount()
                + ", confidence=" + context.getConfidenceScore()
                + ", scope=" + context.getScope()
                + ", targetSections=" + (context.getTargetSectionKeys() == null ? 0 : context.getTargetSectionKeys().size()));

        // Build prompt
        System.out.println(">>> [PLANNER] Building prompt...");
        long promptStart = System.currentTimeMillis();
        Prompt prompt = plannerPromptBuilder.buildPrompt(context, req.getSections(), req.getAssets());
        System.out.println(">>> [PLANNER] Prompt built in " + (System.currentTimeMillis() - promptStart) + "ms");

        // Call model
        System.out.println(">>> [PLANNER] Calling OpenAI model...");
        long aiStart = System.currentTimeMillis();
        ChatResponse response = openAiChatModel.call(prompt);
        System.out.println(">>> [PLANNER] OpenAI call completed in " + (System.currentTimeMillis() - aiStart) + "ms");
        String rawJson = response.getResult().getOutput().getText();
        System.out.println(">>> [PLANNER] Raw response length: " + (rawJson == null ? 0 : rawJson.length()) + " chars");

        // Parse response
        System.out.println(">>> [PLANNER] Parsing response...");
        long parseStart = System.currentTimeMillis();
        PlannerResponseDTO parsed = plannerResponseParser.parse(rawJson);
        System.out.println(">>> [PLANNER] Parse completed in " + (System.currentTimeMillis() - parseStart) + "ms");

        // Debug output
        System.out.println("=== PLANNER RESPONSE ===");
        System.out.println("Portfolio ID: " + req.getPortfolioId());
        System.out.println("Plan Summary: " + parsed.getPlanSummary());
        System.out.println("Section Plans: " + parsed.getSectionPlans().size());
        parsed.getSectionPlans().forEach(p ->
                System.out.println("  - " + p.getSectionKey() + ": " + p.getAction())
        );
        System.out.println("========================");
        System.out.println(">>> [PLANNER] Returning planner response");

        return parsed;
    }
}
