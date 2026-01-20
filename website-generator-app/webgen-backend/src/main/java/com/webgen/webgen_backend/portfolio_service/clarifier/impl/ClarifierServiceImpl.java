package com.webgen.webgen_backend.portfolio_service.clarifier.impl;

import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ChangeIntensity;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierConstraints;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio_service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio_service.parser.ClarifierResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.ClarifierPromptBuilder;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ClarifierServiceImpl implements ClarifierService {
    @Resource(name = "clarifierModel")
    private OpenAiChatModel openAiChatModel;
    private final ClarifierPromptBuilder clarifierPromptBuilder;
    private final ClarifierResponseParser clarifierResponseParser;

    // In memory context store (swap for DB/Redis later)
    private final Map<UUID, ClarifierContext> contextStore = new ConcurrentHashMap<>();

    @Override
    public ClarifierResponseDTO clarify(ClarifierRequestDTO req) {
        if (req == null || req.getPortfolioId() == null || req.getUserPrompt() == null )
            throw new IllegalArgumentException("portfolioId and userPrompt required!");

        // Load or retrieve context given portfolioId
        ClarifierContext context = contextStore.computeIfAbsent(
                req.getPortfolioId(),
                id -> newContext()
        );

        // Build prompt
        // Contains fields for classfierResponseDTO
        // Contains updated context
        Prompt prompt = clarifierPromptBuilder.buildPrompt(
                req.getUserPrompt(),
                req.getSections(),
                context,
                req.getAssets()
        );

        // Call model
        ChatResponse response = openAiChatModel.call(prompt);

        // Parse + validate response JSON
        ClarifierResponseDTO parsed = clarifierResponseParser.parse(response.getResult().getOutput().getText());

        // Update in memory context store
        ClarifierContext updatedContext = clarifierResponseParser.getUpdatedContext();

        // Force increment turnCount server-side (don't rely on AI)
        updatedContext.setTurnCount(context.getTurnCount() + 1);

        contextStore.put(req.getPortfolioId(), updatedContext);

        // === STOPPING LOGIC ===
        // Override AI's decision when certain conditions are met
        boolean scopeDetermined = updatedContext.getScope() != null
                && !updatedContext.getScope().equals("unknown");
        boolean highConfidence = updatedContext.getConfidenceScore() >= 0.70;
        boolean noOpenQuestions = updatedContext.getOpenQuestions() == null
                || updatedContext.getOpenQuestions().isEmpty();
        boolean maxTurnsReached = updatedContext.getTurnCount() >= 5;

        // Force completion if:
        // 1. High confidence + scope determined + no open questions
        // 2. OR max turns reached (prevent infinite loop)
        if ((highConfidence && scopeDetermined && noOpenQuestions) || maxTurnsReached) {
            parsed.setClarificationComplete(true);
            parsed.setReadyForPlanning(true);

            if (maxTurnsReached && !parsed.isClarificationComplete()) {
                System.out.println(">>> FORCED COMPLETION: Max turns (5) reached");
            } else {
                System.out.println(">>> AUTO COMPLETION: Confidence=" + updatedContext.getConfidenceScore()
                        + ", Scope=" + updatedContext.getScope()
                        + ", OpenQuestions=" + (noOpenQuestions ? "none" : updatedContext.getOpenQuestions().size()));
            }
        }

        // Debug: Print updated context
        System.out.println("=== CLARIFIER CONTEXT UPDATED ===");
        System.out.println("Portfolio ID: " + req.getPortfolioId());
        System.out.println("Turn Count: " + updatedContext.getTurnCount());
        System.out.println("Confidence Score: " + updatedContext.getConfidenceScore());
        System.out.println("Scope: " + updatedContext.getScope());
        System.out.println("Global Intent: " + updatedContext.getGlobalIntent());
        System.out.println("Target Sections: " + updatedContext.getTargetSectionKeys());
        System.out.println("Open Questions: " + updatedContext.getOpenQuestions());
        System.out.println("Assumptions: " + updatedContext.getAssumptions());
        System.out.println("Constraints: " + updatedContext.getConstraints());
        System.out.println("=================================");

        return parsed;
    }

    @Override
    public ClarifierContext getContext(UUID portfolioId) {
        return contextStore.get(portfolioId);
    }

    // Return a default initialized clarifierContext
    private ClarifierContext newContext() {
        ClarifierContext context = new ClarifierContext();
        context.setConfidenceScore(0.0);
        context.setGlobalIntent("");
        context.setSectionIntents(new HashMap<>());
        context.setTargetSectionKeys(new ArrayList<>());
        context.setScope("unknown");
        context.setOpenQuestions(new ArrayList<>());
        context.setAssumptions(new ArrayList<>());

        // -- Default initialize constraints
        ClarifierConstraints constraints = new ClarifierConstraints();
        constraints.setAvoidCasualTone(false);
        constraints.setReduceTextDensity(false);
        constraints.setPreserveContent(false);
        constraints.setChangeIntensity(ChangeIntensity.MEDIUM);
        constraints.setLockedSectionKeys(new ArrayList<>());

        context.setConstraints(constraints);
        context.setLastUserMessage("");
        context.setTurnCount(0);
        return context;
    }
}
