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
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId required!");

        // Get context from clarifier
        ClarifierContext context = clarifierService.getContext(req.getPortfolioId());
        if (context == null)
            throw new IllegalStateException("No clarifier context found. Run clarify first.");

        // Build prompt
        Prompt prompt = plannerPromptBuilder.buildPrompt(context, req.getSections(), req.getAssets());

        // Call model
        ChatResponse response = openAiChatModel.call(prompt);

        // Parse response
        PlannerResponseDTO parsed = plannerResponseParser.parse(
                response.getResult().getOutput().getText()
        );

        // Debug output
        System.out.println("=== PLANNER RESPONSE ===");
        System.out.println("Portfolio ID: " + req.getPortfolioId());
        System.out.println("Plan Summary: " + parsed.getPlanSummary());
        System.out.println("Section Plans: " + parsed.getSectionPlans().size());
        parsed.getSectionPlans().forEach(p ->
                System.out.println("  - " + p.getSectionKey() + ": " + p.getAction())
        );
        System.out.println("========================");

        return parsed;
    }
}
