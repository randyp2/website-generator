package com.webgen.webgen_backend.agent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.agent.dto.AgentMessageDTO;
import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.service.ai.AgentAiResponse;
import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentMessageRole;
import com.webgen.webgen_backend.agent.entity.AgentRun;
import com.webgen.webgen_backend.agent.entity.AgentRunStatus;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import com.webgen.webgen_backend.agent.entity.AgentToolRun;
import com.webgen.webgen_backend.agent.entity.AgentToolRunStatus;
import com.webgen.webgen_backend.agent.repository.AgentMessageRepository;
import com.webgen.webgen_backend.agent.repository.AgentRunRepository;
import com.webgen.webgen_backend.agent.repository.AgentSessionRepository;
import com.webgen.webgen_backend.agent.repository.AgentToolRunRepository;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.prompt.Prompt;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentTurnPersistenceService {

    private final PortfolioRepository portfolioRepository;
    private final AgentSessionRepository agentSessionRepository;
    private final AgentMessageRepository agentMessageRepository;
    private final AgentRunRepository agentRunRepository;
    private final AgentToolRunRepository agentToolRunRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AgentTurnContext startTurn(UUID userId, UUID portfolioId, String userMessage) {
        Portfolio portfolio = loadOwnedPortfolio(userId, portfolioId);
        AgentSession session = lockOrCreateActiveSession(portfolio);

        long userSequenceNo = agentMessageRepository.nextSequenceNo(session.getId());
        AgentMessage persistedUserMessage = appendMessage(
                session.getId(),
                userSequenceNo,
                AgentMessageRole.USER,
                userMessage,
                null,
                null);
        AgentRun run = startRun(session.getId(), persistedUserMessage.getId());
        List<AgentMessage> history = agentMessageRepository.findBySessionIdOrderBySequenceNoAsc(session.getId());

        return new AgentTurnContext(portfolio, session, run, persistedUserMessage, history);
    }

    @Transactional
    public AgentMessageDTO completeTurn(
            UUID sessionId,
            UUID runId,
            AgentStructuredPlanDTO plan,
            String assistantText,
            List<AgentToolExecutionResult> toolResults,
            AgentAiResponse aiResponse,
            Prompt prompt) {
        AgentSession session = agentSessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent session not found"));
        AgentRun run = agentRunRepository.findById(runId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent run not found"));

        recordRunTelemetry(run, aiResponse, prompt, plan, toolResults);
        applySessionUpdatesFromPlan(session, plan);

        long sequenceNo = agentMessageRepository.nextSequenceNo(sessionId);
        for (AgentToolExecutionResult toolResult : toolResults) {
            AgentToolRun persistedToolRun = persistToolRun(sessionId, runId, toolResult);
            appendMessage(
                    sessionId,
                    sequenceNo++,
                    AgentMessageRole.TOOL,
                    buildToolMessageContent(toolResult),
                    toolResult.getToolName() == null ? "unknown" : toolResult.getToolName().getWireName(),
                    persistedToolRun.getId().toString());
        }

        AgentMessage assistantMessage = appendMessage(
                sessionId,
                sequenceNo,
                AgentMessageRole.ASSISTANT,
                assistantText,
                null,
                null);

        completeRun(run, assistantMessage.getId());
        touchSession(session);
        return toMessageDto(assistantMessage);
    }

    @Transactional
    public void failRun(UUID runId, RuntimeException exception) {
        AgentRun run = agentRunRepository.findById(runId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent run not found"));
        run.setStatus(AgentRunStatus.FAILED);
        run.setErrorCode(exception.getClass().getSimpleName());
        run.setErrorMessage(exception.getMessage());
        run.setFinishedAt(OffsetDateTime.now());
        agentRunRepository.save(run);
    }

    private Portfolio loadOwnedPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!userId.equals(portfolio.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this portfolio");
        }
        return portfolio;
    }

    private AgentSession lockOrCreateActiveSession(Portfolio portfolio) {
        return agentSessionRepository
                .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                .map(existing -> agentSessionRepository.findByIdForUpdate(existing.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Active agent session disappeared during lock acquisition")))
                .orElseGet(() -> createActiveSessionWithRaceRecovery(portfolio));
    }

    private AgentSession createActiveSessionWithRaceRecovery(Portfolio portfolio) {
        AgentSession newSession = new AgentSession();
        newSession.setPortfolioId(portfolio.getId());
        newSession.setUserId(portfolio.getUserId());
        newSession.setStatus(AgentSessionStatus.ACTIVE);

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

    private AgentRun startRun(UUID sessionId, UUID userMessageId) {
        AgentRun run = new AgentRun();
        run.setSessionId(sessionId);
        run.setUserMessageId(userMessageId);
        run.setStatus(AgentRunStatus.RUNNING);
        return agentRunRepository.save(run);
    }

    private void recordRunTelemetry(
            AgentRun run,
            AgentAiResponse aiResponse,
            Prompt prompt,
            AgentStructuredPlanDTO plan,
            List<AgentToolExecutionResult> toolResults) {
        run.setModel(aiResponse.model());
        run.setInputTokens(aiResponse.inputTokens());
        run.setOutputTokens(aiResponse.outputTokens());
        if (aiResponse.inputTokens() != null && aiResponse.outputTokens() != null) {
            run.setTotalTokens(aiResponse.inputTokens() + aiResponse.outputTokens());
        }
        run.setRawRequestJson(buildRawRequestJson(prompt));
        run.setRawResponseJson(buildRawResponseJson(aiResponse, plan, toolResults));
        agentRunRepository.save(run);
    }

    private JsonNode buildRawRequestJson(Prompt prompt) {
        ObjectNode requestJson = objectMapper.createObjectNode();
        var messagesJson = requestJson.putArray("messages");
        if (prompt != null && prompt.getInstructions() != null) {
            for (Message message : prompt.getInstructions()) {
                ObjectNode messageJson = messagesJson.addObject();
                messageJson.put("type", message.getMessageType() == null ? "UNKNOWN" : message.getMessageType().name());
                messageJson.put("content", message.getText() == null ? "" : message.getText());
            }
        }
        return requestJson;
    }

    private JsonNode buildRawResponseJson(
            AgentAiResponse aiResponse,
            AgentStructuredPlanDTO plan,
            List<AgentToolExecutionResult> toolResults) {
        ObjectNode responseJson = objectMapper.createObjectNode();
        responseJson.put("model", aiResponse.model());
        responseJson.put("assistedText", aiResponse.assistedText());
        responseJson.set("structuredPlan", objectMapper.valueToTree(plan));
        responseJson.set("toolResults", objectMapper.valueToTree(toolResults));
        return responseJson;
    }

    private void applySessionUpdatesFromPlan(AgentSession session, AgentStructuredPlanDTO plan) {
        if (plan.getSessionStage() != null) {
            session.setStage(plan.getSessionStage());
        }
        if (plan.getSessionStatus() != null) {
            session.setStatus(plan.getSessionStatus());
        }

        JsonNode memoryUpdates = plan.getMemoryUpdates();
        if (memoryUpdates != null && memoryUpdates.isObject()) {
            ObjectNode mergedMemory = session.getMemoryJson() != null && session.getMemoryJson().isObject()
                    ? (ObjectNode) session.getMemoryJson().deepCopy()
                    : objectMapper.createObjectNode();
            mergedMemory.setAll((ObjectNode) memoryUpdates);
            session.setMemoryJson(mergedMemory);
        }
    }

    private AgentToolRun persistToolRun(UUID sessionId, UUID runId, AgentToolExecutionResult result) {
        AgentToolRun toolRun = new AgentToolRun();
        toolRun.setSessionId(sessionId);
        toolRun.setAgentRunId(runId);
        toolRun.setToolName(result.getToolName() == null ? "unknown" : result.getToolName().getWireName());
        toolRun.setStatus(toToolRunStatus(result.getStatus()));
        toolRun.setArgsJson(objectMapper.valueToTree(result.getInputJson() == null ? Map.of() : result.getInputJson()));
        toolRun.setResultJson(objectMapper.valueToTree(result.getOutputJson() == null ? Map.of() : result.getOutputJson()));
        toolRun.setErrorMessage(result.getErrorMessage());
        toolRun.setFinishedAt(OffsetDateTime.now());
        return agentToolRunRepository.save(toolRun);
    }

    private AgentToolRunStatus toToolRunStatus(AgentToolCallStatus status) {
        if (status == AgentToolCallStatus.SUCCEEDED) {
            return AgentToolRunStatus.SUCCEEDED;
        }
        if (status == AgentToolCallStatus.FAILED) {
            return AgentToolRunStatus.FAILED;
        }
        return AgentToolRunStatus.CANCELLED;
    }

    private String buildToolMessageContent(AgentToolExecutionResult result) {
        ObjectNode content = objectMapper.createObjectNode();
        content.put("toolName", result.getToolName() == null ? "unknown" : result.getToolName().getWireName());
        content.put("status", result.getStatus() == null ? "UNKNOWN" : result.getStatus().name());
        content.set("output", objectMapper.valueToTree(result.getOutputJson() == null ? Map.of() : result.getOutputJson()));
        if (result.getErrorMessage() != null) {
            content.put("errorMessage", result.getErrorMessage());
        }
        return content.toString();
    }

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

    private void touchSession(AgentSession session) {
        OffsetDateTime now = OffsetDateTime.now();
        session.setLastActivityAt(now);
        session.setUpdatedAt(now);
        agentSessionRepository.save(session);
    }

    private AgentMessageDTO toMessageDto(AgentMessage message) {
        return AgentMessageDTO.builder()
                .id(message.getId())
                .sessionId(message.getSessionId())
                .sequenceNo(message.getSequenceNo())
                .role(message.getRole())
                .content(message.getContent())
                .contentJson(message.getContentJson())
                .toolName(message.getToolName())
                .toolCallId(message.getToolCallId())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
