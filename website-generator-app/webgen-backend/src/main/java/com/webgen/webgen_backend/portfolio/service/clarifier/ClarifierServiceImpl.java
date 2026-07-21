package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ChangeIntensity;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConstraints;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConversationMessage;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierSessionState;
import com.webgen.webgen_backend.portfolio.service.parser.ClarifierResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.ClarifierPromptBuilder;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClarifierServiceImpl implements ClarifierService {
    @Resource(name = "clarifierModel")
    private OpenAiChatModel openAiChatModel;
    private final ClarifierPromptBuilder clarifierPromptBuilder;
    private final ClarifierResponseParser clarifierResponseParser;
    private final ClarifierSessionStore clarifierSessionStore;
    private final ClarifierConversationHistoryPolicy conversationHistoryPolicy;
    private final ClarifierReplyPolicy clarifierReplyPolicy;

    @Override
    public ClarifierResponseDTO clarify(ClarifierRequestDTO req) {
        if (req == null || req.getPortfolioId() == null || req.getUserPrompt() == null )
            throw new IllegalArgumentException("portfolioId and userPrompt required!");

        // Resolve session: use existing sessionId or generate a new one
        String sessionId = req.getSessionId();
        ClarifierSessionState sessionState = null;

        if (sessionId != null && !sessionId.isBlank()) {
            sessionState = clarifierSessionStore.find(sessionId);
        }

        if (sessionState == null) {
            // The controller pre-mints paid session ids. Direct service callers
            // still receive an id for backward-compatible internal use.
            if (sessionId == null || sessionId.isBlank()) {
                sessionId = UUID.randomUUID().toString();
            }
            sessionState = new ClarifierSessionState(newContext(), List.of());
        }
        ClarifierContext context = sessionState.context();
        List<ClarifierConversationMessage> recentMessages = sessionState.recentMessages();

        log.debug("Clarifier context loaded sessionId={} turnCount={} confidence={} scope={}",
                sessionId, context.getTurnCount(), context.getConfidenceScore(), context.getScope());

        Prompt prompt = clarifierPromptBuilder.buildPrompt(
                req.getUserPrompt(),
                req.getSections(),
                context,
                req.getAssets(),
                recentMessages
        );

        long aiStart = System.currentTimeMillis();
        ChatResponse response = openAiChatModel.call(prompt);
        log.debug("Clarifier model call completed sessionId={} durationMs={}",
                sessionId, System.currentTimeMillis() - aiStart);
        String rawJson = response.getResult().getOutput().getText();

        // Parse + validate response JSON
        ClarifierResponseDTO parsed = clarifierResponseParser.parse(rawJson);

        // Update context from the model's response
        ClarifierContext updatedContext = clarifierResponseParser.getUpdatedContext();

        clarifierReplyPolicy.reconcile(
                context,
                updatedContext,
                recentMessages,
                req.getUserPrompt(),
                parsed
        );

        // --- Turn counting is per clarification CYCLE, not per session: a turn
        // that delivered a plan closes its cycle, so the next message gets a
        // fresh budget instead of force-planning forever once the cap is hit
        int cycleTurns = context.isLastTurnReadyForPlanning() ? 0 : context.getTurnCount();
        updatedContext.setTurnCount(cycleTurns + 1);

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
                log.debug("Clarifier forced completion sessionId={} reason=maxTurnsReached turns={}",
                        sessionId, updatedContext.getTurnCount());
            } else {
                log.debug("Clarifier auto completion sessionId={} confidence={} scope={} openQuestions={}",
                        sessionId, updatedContext.getConfidenceScore(), updatedContext.getScope(),
                        noOpenQuestions ? 0 : updatedContext.getOpenQuestions().size());
            }
        }

        // --- Intent gate: readiness describes what the SESSION knows, but
        // planning requires the LATEST message to actually request something.
        // Greetings and small talk must never re-plan a finished conversation.
        if (!parsed.isAdvancesRequest()) {
            if (parsed.isReadyForPlanning() || parsed.isClarificationComplete()) {
                log.debug("Clarifier intent gate suppressed planning sessionId={} reason=messageDoesNotAdvanceRequest",
                        sessionId);
            }
            parsed.setReadyForPlanning(false);
            parsed.setClarificationComplete(false);
        }

        // If we're ready to plan, ensure we don't ask another question
        if (parsed.isReadyForPlanning()) {
            parsed.setAssistantMessage(
                    "Got it. I have enough context to proceed to planning your updates."
            );
        }

        // Persist the final decision so the next message knows whether it
        // starts a new cycle
        updatedContext.setLastTurnReadyForPlanning(parsed.isReadyForPlanning());
        List<ClarifierConversationMessage> updatedMessages =
                conversationHistoryPolicy.appendExchange(
                        recentMessages,
                        req.getUserPrompt(),
                        parsed.getAssistantMessage()
                );
        clarifierSessionStore.save(
                sessionId,
                new ClarifierSessionState(updatedContext, updatedMessages)
        );

        // Always return the sessionId so the frontend can pass it on subsequent calls
        parsed.setSessionId(sessionId);

        log.debug("Clarify complete sessionId={} readyForPlanning={} clarificationComplete={}",
                sessionId, parsed.isReadyForPlanning(), parsed.isClarificationComplete());

        return parsed;
    }

    @Override
    public ClarifierContext getContext(String sessionId) {
        ClarifierSessionState sessionState = clarifierSessionStore.find(sessionId);
        return sessionState == null ? null : sessionState.context();
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
