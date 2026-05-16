package com.webgen.webgen_backend.agent.service.tool;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.tool.StyleChatToolInputDTO;
import com.webgen.webgen_backend.agent.entity.AgentToolRun;
import com.webgen.webgen_backend.agent.entity.AgentToolRunStatus;
import com.webgen.webgen_backend.agent.repository.AgentToolRunRepository;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.service.style.StyleChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentStyleChatToolService {

    private final StyleChatService styleChatService;
    private final AgentToolRunRepository agentToolRunRepository;
    private final ObjectMapper objectMapper;

    /**
     * Continues the existing style discovery flow using the portfolio-scoped style chat service.
     *
     * The portfolio id is always resolved from tool context, not from model arguments.
     */
    @Tool(
            name = "style_chat_tool",
            description = "Continue the style discovery flow. Use when the user answers style questions or submits color, typography, or layout selections."
    )
    public StyleChatResponseDTO runStyleChat(StyleChatToolInputDTO input, ToolContext toolContext) {
        AgentToolRun toolRun = startToolRun(input, toolContext);
        OffsetDateTime startedAt = toolRun.getStartedAt() == null ? OffsetDateTime.now() : toolRun.getStartedAt();

        UUID portfolioId = readPortfolioIdFromContext(toolContext);

        StyleChatRequestDTO request = new StyleChatRequestDTO();
        request.setPortfolioId(portfolioId);
        if (input != null) {
            request.setUserMessage(input.getUserMessage());
            request.setColorSelections(input.getColorSelections());
            request.setFontSelections(input.getFontSelections());
            request.setLayoutSelection(input.getLayoutSelection());
        }

        try {
            StyleChatResponseDTO result = styleChatService.chat(request);
            markToolRunSucceeded(toolRun, startedAt, result);
            return result;
        } catch (RuntimeException exception) {
            markToolRunFailed(toolRun, startedAt, exception);
            throw exception;
        }
    }

    /**
     * Resolves and validates the required portfolio id passed through ToolContext.
     */
    private UUID readPortfolioIdFromContext(ToolContext toolContext) {
        Map<String, Object> context = requireToolContext(toolContext);
        return readContextUuid(context, "portfolioId");
    }

    /**
     * Creates and persists a running tool-run record.
     */
    private AgentToolRun startToolRun(StyleChatToolInputDTO input, ToolContext toolContext) {
        Map<String, Object> context = requireToolContext(toolContext);
        UUID sessionId = readContextUuid(context, "sessionId");
        UUID agentRunId = readContextUuid(context, "agentRunId");

        AgentToolRun toolRun = new AgentToolRun();
        toolRun.setSessionId(sessionId);
        toolRun.setAgentRunId(agentRunId);
        toolRun.setToolName("style_chat_tool");
        toolRun.setStatus(AgentToolRunStatus.RUNNING);
        toolRun.setArgsJson(toJsonNode(input));
        return agentToolRunRepository.save(toolRun);
    }

    /**
     * Marks a tool-run row as successful and stores the tool result.
     */
    private void markToolRunSucceeded(AgentToolRun toolRun, OffsetDateTime startedAt, StyleChatResponseDTO result) {
        OffsetDateTime finishedAt = OffsetDateTime.now();
        toolRun.setStatus(AgentToolRunStatus.SUCCEEDED);
        toolRun.setResultJson(toJsonNode(result));
        toolRun.setFinishedAt(finishedAt);
        toolRun.setDurationMs(durationMillis(startedAt, finishedAt));
        agentToolRunRepository.save(toolRun);
    }

    /**
     * Marks a tool-run row as failed and stores failure metadata.
     */
    private void markToolRunFailed(AgentToolRun toolRun, OffsetDateTime startedAt, RuntimeException exception) {
        try {
            OffsetDateTime finishedAt = OffsetDateTime.now();
            toolRun.setStatus(AgentToolRunStatus.FAILED);
            toolRun.setErrorCode(exception.getClass().getSimpleName());
            toolRun.setErrorMessage(exception.getMessage());
            toolRun.setFinishedAt(finishedAt);
            toolRun.setDurationMs(durationMillis(startedAt, finishedAt));
            agentToolRunRepository.save(toolRun);
        } catch (Exception persistenceException) {
            log.warn("Failed to persist agent tool failure row for style_chat_tool", persistenceException);
        }
    }

    /**
     * Reads and validates the required tool context map.
     */
    private Map<String, Object> requireToolContext(ToolContext toolContext) {
        if (toolContext == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "toolContext is required for style_chat_tool");
        }

        Map<String, Object> context = toolContext.getContext();
        if (context == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "toolContext map is required for style_chat_tool");
        }
        return context;
    }

    /**
     * Parses a required UUID value from tool context.
     */
    private UUID readContextUuid(Map<String, Object> context, String key) {
        Object rawValue = context.get(key);
        if (rawValue == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required in toolContext");
        }

        try {
            return UUID.fromString(String.valueOf(rawValue));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid " + key + " in toolContext", exception);
        }
    }

    /**
     * Converts an object into a JSON payload for run logging.
     */
    private JsonNode toJsonNode(Object source) {
        if (source == null) {
            return objectMapper.createObjectNode();
        }
        try {
            JsonNode node = objectMapper.valueToTree(source);
            return node == null ? objectMapper.createObjectNode() : node;
        } catch (Exception exception) {
            return objectMapper.createObjectNode();
        }
    }

    /**
     * Calculates duration milliseconds between two timestamps.
     */
    private long durationMillis(OffsetDateTime startedAt, OffsetDateTime finishedAt) {
        return finishedAt.toInstant().toEpochMilli() - startedAt.toInstant().toEpochMilli();
    }
}
