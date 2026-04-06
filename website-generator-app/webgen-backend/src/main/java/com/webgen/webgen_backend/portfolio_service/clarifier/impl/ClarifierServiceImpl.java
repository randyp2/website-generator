package com.webgen.webgen_backend.portfolio_service.clarifier.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClarifierServiceImpl implements ClarifierService {
    @Resource(name = "clarifierModel")
    private OpenAiChatModel openAiChatModel;
    private final ClarifierPromptBuilder clarifierPromptBuilder;
    private final ClarifierResponseParser clarifierResponseParser;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String KEY_PREFIX = "clarifier:context:";
    private static final Duration TTL = Duration.ofMinutes(30);

    @Override
    public ClarifierResponseDTO clarify(ClarifierRequestDTO req) {
        System.out.println(">>> [CLARIFIER] clarify() started");
        if (req == null || req.getPortfolioId() == null || req.getUserPrompt() == null )
            throw new IllegalArgumentException("portfolioId and userPrompt required!");
        System.out.println(">>> [CLARIFIER] Input validation passed");
        System.out.println(">>> [CLARIFIER] Portfolio ID: " + req.getPortfolioId());
        System.out.println(">>> [CLARIFIER] Sections count: " + (req.getSections() == null ? 0 : req.getSections().size()));
        System.out.println(">>> [CLARIFIER] Assets count: " + (req.getAssets() == null ? 0 : req.getAssets().size()));

        // Resolve session: use existing sessionId or generate a new one
        String sessionId = req.getSessionId();
        ClarifierContext context = null;

        if (sessionId != null && !sessionId.isBlank()) {
            context = loadContext(sessionId);
            System.out.println(">>> [CLARIFIER] Existing session context found: " + (context != null));
        }

        if (context == null) {
            // First turn — mint a new session
            sessionId = UUID.randomUUID().toString();
            context = newContext();
            System.out.println(">>> [CLARIFIER] New session created");
        }

        System.out.println(">>> [CLARIFIER] Loaded context with turnCount=" + context.getTurnCount()
                + ", confidence=" + context.getConfidenceScore()
                + ", scope=" + context.getScope());

        // Build prompt
        System.out.println(">>> [CLARIFIER] Building prompt...");
        long promptStart = System.currentTimeMillis();
        Prompt prompt = clarifierPromptBuilder.buildPrompt(
                req.getUserPrompt(),
                req.getSections(),
                context,
                req.getAssets()
        );
        System.out.println(">>> [CLARIFIER] Prompt built in " + (System.currentTimeMillis() - promptStart) + "ms");

        // Call model
        System.out.println(">>> [CLARIFIER] Calling OpenAI model...");
        long aiStart = System.currentTimeMillis();
        ChatResponse response = openAiChatModel.call(prompt);
        System.out.println(">>> [CLARIFIER] OpenAI call completed in " + (System.currentTimeMillis() - aiStart) + "ms");
        String rawJson = response.getResult().getOutput().getText();
        System.out.println(">>> [CLARIFIER] Raw response length: " + (rawJson == null ? 0 : rawJson.length()) + " chars");

        // Parse + validate response JSON
        System.out.println(">>> [CLARIFIER] Parsing response...");
        long parseStart = System.currentTimeMillis();
        ClarifierResponseDTO parsed = clarifierResponseParser.parse(rawJson);
        System.out.println(">>> [CLARIFIER] Parse completed in " + (System.currentTimeMillis() - parseStart) + "ms");
        System.out.println(">>> [CLARIFIER] Parsed flags: clarificationComplete=" + parsed.isClarificationComplete()
                + ", readyForPlanning=" + parsed.isReadyForPlanning());

        // Update context in Redis
        ClarifierContext updatedContext = clarifierResponseParser.getUpdatedContext();

        // Force increment turnCount server-side (don't rely on AI)
        updatedContext.setTurnCount(context.getTurnCount() + 1);

        saveContext(sessionId, updatedContext);

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

        // If we're ready to plan, ensure we don't ask another question
        if (parsed.isReadyForPlanning()) {
            parsed.setAssistantMessage(
                    "Got it. I have enough context to proceed to planning your updates."
            );
        }

        // Always return the sessionId so the frontend can pass it on subsequent calls
        parsed.setSessionId(sessionId);

        System.out.println(">>> [CLARIFIER] Returning clarify response");

        return parsed;
    }

    @Override
    public ClarifierContext getContext(String sessionId) {
        return loadContext(sessionId);
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

    private void saveContext(String sessionId, ClarifierContext context) {
        try {
            String json = objectMapper.writeValueAsString(context);
            String key = KEY_PREFIX + sessionId;
            redisTemplate.opsForValue().set(key, json, TTL);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize clarifier context", e);
        }
    }

    private ClarifierContext loadContext(String sessionId) {
        String key = KEY_PREFIX + sessionId;
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, ClarifierContext.class);
        } catch (JsonProcessingException e) {
            System.err.println(">>> [CLARIFIER] Failed to deserialize context for session: " + sessionId);
            return null;
        }
    }
}
