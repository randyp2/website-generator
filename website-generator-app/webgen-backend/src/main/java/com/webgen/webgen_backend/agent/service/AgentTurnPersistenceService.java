package com.webgen.webgen_backend.agent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
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
        //--- Load the owned portfolio and lock the active agent session
        Portfolio portfolio = loadOwnedPortfolio(userId, portfolioId);
        AgentSession session = lockOrCreateActiveSession(portfolio);

        //--- Persist the user message and open a running agent run
        long userSequenceNo = agentMessageRepository.nextSequenceNo(session.getId());
        AgentMessage persistedUserMessage = appendMessage(
                session.getId(),
                userSequenceNo,
                AgentMessageRole.USER,
                userMessage,
                null,
                null);
        AgentRun run = startRun(session.getId(), persistedUserMessage.getId());

        //--- Reload ordered history so the planner prompt uses durable conversation state
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
        //--- Lock the session and load the run being completed
        AgentSession session = agentSessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent session not found"));
        AgentRun run = agentRunRepository.findById(runId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent run not found"));

        //--- Persist model telemetry and session state updates before messages
        recordRunTelemetry(run, aiResponse, prompt, plan, toolResults);
        applySessionUpdatesFromPlan(session, plan);

        //--- Store each tool result as both a ledger row and timeline message
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

        //--- Append the final assistant message after tool messages
        AgentMessage assistantMessage = appendMessage(
                sessionId,
                sequenceNo,
                AgentMessageRole.ASSISTANT,
                assistantText,
                null,
                null);

        //--- Close the run and refresh session activity timestamps
        completeRun(run, assistantMessage.getId());
        touchSession(session);
        return toMessageDto(assistantMessage);
    }

    @Transactional
    public void failRun(UUID runId, RuntimeException exception) {
        //--- Persist failure details for the active run
        AgentRun run = agentRunRepository.findById(runId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent run not found"));
        run.setStatus(AgentRunStatus.FAILED);
        run.setErrorCode(exception.getClass().getSimpleName());
        run.setErrorMessage(exception.getMessage());
        run.setFinishedAt(OffsetDateTime.now());
        agentRunRepository.save(run);
    }

    private Portfolio loadOwnedPortfolio(UUID userId, UUID portfolioId) {
        //--- Enforce portfolio ownership before starting an agent turn
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!userId.equals(portfolio.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this portfolio");
        }
        return portfolio;
    }

    private AgentSession lockOrCreateActiveSession(Portfolio portfolio) {
        //--- Reuse and lock the active session or create one for the portfolio
        return agentSessionRepository
                .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                .map(existing -> agentSessionRepository.findByIdForUpdate(existing.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Active agent session disappeared during lock acquisition")))
                .orElseGet(() -> createActiveSessionWithRaceRecovery(portfolio));
    }

    private AgentSession createActiveSessionWithRaceRecovery(Portfolio portfolio) {
        //--- Create an active session tied to the portfolio owner
        AgentSession newSession = new AgentSession();
        newSession.setPortfolioId(portfolio.getId());
        newSession.setUserId(portfolio.getUserId());
        newSession.setStatus(AgentSessionStatus.ACTIVE);

        try {
            return agentSessionRepository.saveAndFlush(newSession);
        } catch (DataIntegrityViolationException exception) {
            //--- Recover the concurrently-created active session after unique constraint collision
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
        //--- Persist a single timeline message row
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
        //--- Open a running ledger row for this user message
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
        //--- Store model identity and token usage when available
        run.setModel(aiResponse.model());
        run.setInputTokens(aiResponse.inputTokens());
        run.setOutputTokens(aiResponse.outputTokens());
        if (aiResponse.inputTokens() != null && aiResponse.outputTokens() != null) {
            run.setTotalTokens(aiResponse.inputTokens() + aiResponse.outputTokens());
        }

        //--- Store normalized raw request and response snapshots for debugging
        run.setRawRequestJson(buildRawRequestJson(prompt));
        run.setRawResponseJson(buildRawResponseJson(aiResponse, plan, toolResults));
        agentRunRepository.save(run);
    }

    private JsonNode buildRawRequestJson(Prompt prompt) {
        //--- Convert prompt messages into a compact JSON audit shape
        ObjectNode requestJson = objectMapper.createObjectNode();
        ArrayNode messagesJson = requestJson.putArray("messages");
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
        //--- Convert the model response, parsed plan, and tool output into audit JSON
        ObjectNode responseJson = objectMapper.createObjectNode();
        responseJson.put("model", aiResponse.model());
        responseJson.put("assistedText", aiResponse.assistedText());
        responseJson.set("structuredPlan", objectMapper.valueToTree(plan));
        responseJson.set("toolResults", objectMapper.valueToTree(toolResults));
        return responseJson;
    }

    private void applySessionUpdatesFromPlan(AgentSession session, AgentStructuredPlanDTO plan) {
        //--- Apply planner-provided session status changes
        if (plan.getSessionStatus() != null) {
            session.setStatus(plan.getSessionStatus());
        }

        //--- Merge memory updates into existing session memory JSON
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
        //--- Persist the normalized tool execution ledger row
        OffsetDateTime timestamp = OffsetDateTime.now();
        AgentToolRun toolRun = new AgentToolRun();
        toolRun.setSessionId(sessionId);
        toolRun.setAgentRunId(runId);
        toolRun.setToolName(result.getToolName() == null ? "unknown" : result.getToolName().getWireName());
        toolRun.setStatus(toToolRunStatus(result.getStatus()));
        toolRun.setArgsJson(objectMapper.valueToTree(result.getInputJson() == null ? Map.of() : result.getInputJson()));
        toolRun.setResultJson(objectMapper.valueToTree(result.getOutputJson() == null ? Map.of() : result.getOutputJson()));
        toolRun.setErrorMessage(result.getErrorMessage());
        toolRun.setStartedAt(timestamp);
        toolRun.setFinishedAt(timestamp);
        toolRun.setDurationMs(0L);
        return agentToolRunRepository.save(toolRun);
    }

    private AgentToolRunStatus toToolRunStatus(AgentToolCallStatus status) {
        //--- Map public tool-call status to persisted tool-run status
        if (status == AgentToolCallStatus.SUCCEEDED) {
            return AgentToolRunStatus.SUCCEEDED;
        }
        if (status == AgentToolCallStatus.FAILED) {
            return AgentToolRunStatus.FAILED;
        }
        return AgentToolRunStatus.CANCELLED;
    }

    private String buildToolMessageContent(AgentToolExecutionResult result) {
        //--- Serialize tool output into a timeline message payload
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
        //--- Mark the run complete and calculate duration
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
        //--- Refresh session activity timestamps after a completed turn
        OffsetDateTime now = OffsetDateTime.now();
        session.setLastActivityAt(now);
        session.setUpdatedAt(now);
        agentSessionRepository.save(session);
    }

    private AgentMessageDTO toMessageDto(AgentMessage message) {
        //--- Project the persisted message entity into the API DTO
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
