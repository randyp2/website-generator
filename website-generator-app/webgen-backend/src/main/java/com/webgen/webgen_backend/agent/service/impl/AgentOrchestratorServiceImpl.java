package com.webgen.webgen_backend.agent.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.agent.dto.AgentTurnResultDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAiRequestDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAiResponseDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAssistantPayloadDTO;
import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentMessageRole;
import com.webgen.webgen_backend.agent.entity.AgentRun;
import com.webgen.webgen_backend.agent.entity.AgentRunStatus;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.entity.AgentSessionStage;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import com.webgen.webgen_backend.agent.repository.AgentMessageRepository;
import com.webgen.webgen_backend.agent.repository.AgentRunRepository;
import com.webgen.webgen_backend.agent.repository.AgentSessionRepository;
import com.webgen.webgen_backend.agent.service.AgentAiClient;
import com.webgen.webgen_backend.agent.service.AgentOrchestratorService;
import com.webgen.webgen_backend.agent.service.AgentPromptBuilder;
import com.webgen.webgen_backend.agent.service.parser.AgentResponseParser;
import com.webgen.webgen_backend.agent.service.tool.AgentStyleChatToolService;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentOrchestratorServiceImpl implements AgentOrchestratorService {

    private final PortfolioRepository portfolioRepository;
    private final AgentSessionRepository agentSessionRepository;
    private final AgentMessageRepository agentMessageRepository;
    private final AgentRunRepository agentRunRepository;
    private final AgentPromptBuilder agentPromptBuilder;
    private final AgentAiClient agentAiClient;
    private final AgentResponseParser agentResponseParser;
    private final AgentStyleChatToolService agentStyleChatToolService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public AgentTurnResultDTO processTurn(UUID userId, UUID portfolioId, String userMessage) {
        // --- Validate input
        String normalizedUserMessage = validateAndNormalizeUserMessage(userId, portfolioId, userMessage);

        // --- Upsert to DB: verify ownership and acquire active session
        Portfolio ownedPortfolio = loadOwnedPortfolio(userId, portfolioId);
        AgentSession activeSession = lockOrCreateActiveSession(ownedPortfolio);

        // --- Upsert to DB: append user message and open run
        long userSequenceNo = agentMessageRepository.nextSequenceNo(activeSession.getId());
        AgentMessage persistedUserMessage = appendMessage(
                activeSession.getId(),
                userSequenceNo,
                AgentMessageRole.USER,
                normalizedUserMessage,
                null,
                null);

        // --- Update the run row
        AgentRun run = startRun(activeSession.getId(), persistedUserMessage.getId());

        // --- Build prompt and execute AI turn
        List<AgentMessage> history = agentMessageRepository.findBySessionIdOrderBySequenceNoAsc(activeSession.getId());
        Prompt turnPrompt = agentPromptBuilder.buildTurnPrompt(activeSession, history, normalizedUserMessage);

        Map<String, String> toolContext = buildToolContext(activeSession, run, ownedPortfolio);
        AgentAiResponseDTO aiResponse = invokeAiTurn(turnPrompt, toolContext);
        recordRunTelemetry(run, aiResponse, turnPrompt, toolContext);
        AgentAssistantPayloadDTO payload = agentResponseParser.parseAssistantPayload(aiResponse);

        // --- Update the session row given response
        applySessionUpdatesFromPayload(activeSession, payload);
        String assistantReply = payload.getAssistantMessage();

        // --- Upsert to DB: append assistant message and finalize turn state
        AgentMessage persistedAssistantMessage = appendMessage(
                activeSession.getId(),
                userSequenceNo + 1,
                AgentMessageRole.ASSISTANT,
                assistantReply,
                null,
                null);

        completeRun(run, persistedAssistantMessage.getId());
        touchSession(activeSession);

        return AgentTurnResultDTO.builder()
                .sessionId(activeSession.getId())
                .runId(run.getId())
                .userMessageId(persistedUserMessage.getId())
                .assistantMessageId(persistedAssistantMessage.getId())
                .runStatus(run.getStatus())
                .sessionStage(activeSession.getStage())
                .assistantMessage(assistantReply)
                .completedAt(run.getFinishedAt())
                .build();
    }

    /**
     * Validates required turn inputs and returns a normalized user message.
     */
    private String validateAndNormalizeUserMessage(UUID userId, UUID portfolioId, String userMessage) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
        if (portfolioId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "portfolioId is required");
        }
        if (userMessage == null || userMessage.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userMessage is required");
        }

        String normalized = userMessage.trim();
        if (normalized.length() > 4000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userMessage exceeds maximum length");
        }

        return normalized;
    }

    /**
     * Loads a portfolio and enforces ownership for the authenticated user.
     */
    private Portfolio loadOwnedPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!userId.equals(portfolio.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this portfolio");
        }

        return portfolio;
    }

    /**
     * Retrieves the active session for a portfolio with a write lock, or creates
     * one.
     */
    private AgentSession lockOrCreateActiveSession(Portfolio portfolio) {
        return agentSessionRepository
                .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                .map(existing -> agentSessionRepository.findByIdForUpdate(existing.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Active agent session disappeared during lock acquisition")))
                .orElseGet(() -> createActiveSessionWithRaceRecovery(portfolio));
    }

    /**
     * Creates a new active session and retries read path if a concurrent insert
     * wins.
     */
    private AgentSession createActiveSessionWithRaceRecovery(Portfolio portfolio) {
        AgentSession newSession = new AgentSession();
        newSession.setPortfolioId(portfolio.getId());
        newSession.setUserId(portfolio.getUserId());
        newSession.setStatus(AgentSessionStatus.ACTIVE);
        newSession.setStage(AgentSessionStage.DISCOVERY);
        newSession.setCurrentJobId(null);

        try {
            return agentSessionRepository.saveAndFlush(newSession);
        } catch (DataIntegrityViolationException exception) {
            return agentSessionRepository
                    .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                    .flatMap(existing -> agentSessionRepository.findByIdForUpdate(existing.getId()))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Failed to create or recover active agent session",
                            exception));
        }
    }

    /**
     * Persists a single message row for the session timeline.
     */
    private AgentMessage appendMessage(
            UUID sessionId,
            long sequenceNo,
            AgentMessageRole role,
            String content,
            String toolName,
            String toolCallId) {
        AgentMessage message = new AgentMessage();
        message.setSessionId(sessionId);
        message.setSequenceNo(sequenceNo);
        message.setRole(role);
        message.setContent(content);
        message.setToolName(toolName);
        message.setToolCallId(toolCallId);
        return agentMessageRepository.save(message);
    }

    /**
     * Creates a running agent run row for the current user message.
     */
    private AgentRun startRun(UUID sessionId, UUID userMessageId) {
        AgentRun run = new AgentRun();
        run.setSessionId(sessionId);
        run.setUserMessageId(userMessageId);
        run.setStatus(AgentRunStatus.RUNNING);
        return agentRunRepository.save(run);
    }

    /**
     * Executes one AI turn with prompt and scoped tool context.
     */
    private AgentAiResponseDTO invokeAiTurn(Prompt prompt, Map<String, String> toolContext) {
        AgentAiRequestDTO request = AgentAiRequestDTO.builder()
                .prompt(prompt)
                .tools(List.of(agentStyleChatToolService))
                .toolContext(toolContext)
                .build();
        return agentAiClient.call(request);
    }

    /**
     * Builds a stable string context map passed into tool execution scope.
     */
    private Map<String, String> buildToolContext(AgentSession session, AgentRun run, Portfolio portfolio) {
        return Map.of(
                "sessionId", session.getId().toString(),
                "agentRunId", run.getId().toString(),
                "portfolioId", portfolio.getId().toString(),
                "userId", portfolio.getUserId().toString(),
                "sessionStage", session.getStage().name());
    }

    /**
     * Persists model, token, and raw request/response metadata for observability.
     */
    private void recordRunTelemetry(
            AgentRun run,
            AgentAiResponseDTO aiResponse,
            Prompt prompt,
            Map<String, String> toolContext) {
        if (run == null || aiResponse == null) {
            return;
        }

        run.setModel(aiResponse.getModel());
        run.setInputTokens(aiResponse.getInputTokens());
        run.setOutputTokens(aiResponse.getOutputTokens());
        if (aiResponse.getInputTokens() != null && aiResponse.getOutputTokens() != null) {
            run.setTotalTokens(aiResponse.getInputTokens() + aiResponse.getOutputTokens());
        } else {
            run.setTotalTokens(null);
        }
        run.setRawRequestJson(buildRawRequestJson(prompt, toolContext));
        run.setRawResponseJson(toJsonNode(aiResponse.getRawResponse()));

        agentRunRepository.save(run);
    }

    /**
     * Builds a compact serializable request snapshot for the run audit row.
     */
    private JsonNode buildRawRequestJson(Prompt prompt, Map<String, String> toolContext) {
        ObjectNode requestJson = objectMapper.createObjectNode();
        requestJson.set("toolContext", toJsonNode(toolContext));

        var messagesJson = requestJson.putArray("messages");
        if (prompt != null && prompt.getInstructions() != null) {
            for (Message message : prompt.getInstructions()) {
                ObjectNode messageJson = messagesJson.addObject();
                messageJson.put(
                        "type",
                        message != null && message.getMessageType() != null
                                ? message.getMessageType().name()
                                : "UNKNOWN");
                messageJson.put(
                        "content",
                        message != null && message.getText() != null
                                ? message.getText()
                                : "");
            }
        }

        return requestJson;
    }

    /**
     * Safely converts an object to JsonNode without failing the current turn.
     */
    private JsonNode toJsonNode(Object source) {
        try {
            return source == null ? null : objectMapper.valueToTree(source);
        } catch (Exception ignored) {
            return objectMapper.createObjectNode();
        }
    }

    /**
     * Applies stage, status, and memory updates returned by the assistant payload.
     */
    private void applySessionUpdatesFromPayload(AgentSession session, AgentAssistantPayloadDTO payload) {
        if (payload.getSessionStage() != null) {
            session.setStage(payload.getSessionStage());
        }
        if (payload.getSessionStatus() != null) {
            session.setStatus(payload.getSessionStatus());
        }

        JsonNode memoryUpdates = payload.getMemoryUpdates();
        if (memoryUpdates != null && memoryUpdates.isObject()) {
            ObjectNode mergedMemory = session.getMemoryJson() != null && session.getMemoryJson().isObject()
                    ? (ObjectNode) session.getMemoryJson().deepCopy()
                    : objectMapper.createObjectNode();
            mergedMemory.setAll((ObjectNode) memoryUpdates);
            session.setMemoryJson(mergedMemory);
        }
    }

    /**
     * Finalizes the run with an assistant message and completion metadata.
     */
    private void completeRun(AgentRun run, UUID assistantMessageId) {
        OffsetDateTime finishedAt = OffsetDateTime.now();
        run.setAssistantMessageId(assistantMessageId);
        run.setStatus(AgentRunStatus.COMPLETED);
        run.setFinishedAt(finishedAt);
        if (run.getStartedAt() != null) {
            run.setDurationMs(finishedAt.toInstant().toEpochMilli() - run.getStartedAt().toInstant().toEpochMilli());
        }
        agentRunRepository.save(run);
    }

    /**
     * Updates session activity timestamps after a successful turn.
     */
    private void touchSession(AgentSession session) {
        OffsetDateTime now = OffsetDateTime.now();
        session.setLastActivityAt(now);
        session.setUpdatedAt(now);
        agentSessionRepository.save(session);
    }
}
