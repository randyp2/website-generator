package com.webgen.webgen_backend.agent.tools;

import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.dto.common.AgentToolName;
import com.webgen.webgen_backend.agent.dto.common.AgentToolRequestDTO;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class AgentToolExecutor {

    private static final String TOOL_TYPE = "structured_output";

    private final Map<AgentToolName, AgentToolHandler> handlersByToolName;

    public AgentToolExecutor(List<AgentToolHandler> toolHandlers) {
        this.handlersByToolName = indexHandlers(toolHandlers);
    }

    public List<AgentToolExecutionResult> execute(UUID portfolioId, List<AgentToolRequestDTO> toolRequests) {
        //--- Execute each requested tool in planner order
        return toolRequests == null
                ? List.of()
                : toolRequests.stream()
                        .map(toolRequest -> execute(portfolioId, toolRequest))
                        .toList();
    }

    public AgentToolExecutionResult execute(UUID portfolioId, AgentToolRequestDTO toolRequest) {
        //--- Reject malformed tool requests with a normalized skipped result
        if (toolRequest == null || toolRequest.getToolName() == null || toolRequest.getToolName() == AgentToolName.UNKNOWN) {
            return skippedTool(toolRequest, "Tool request is missing a valid toolName.");
        }

        //--- Resolve a handler from the registry without coupling orchestration to tool classes
        AgentToolHandler handler = handlersByToolName.get(toolRequest.getToolName());
        if (handler == null) {
            return skippedTool(toolRequest, "Tool execution is not implemented yet.");
        }

        //--- Execute the handler and carry synthesis behavior into the normalized result
        AgentToolExecutionResult result = handler.execute(portfolioId, toolRequest);
        result.setFeedsSynthesis(handler.feedsSynthesis());
        return result;
    }

    private Map<AgentToolName, AgentToolHandler> indexHandlers(List<AgentToolHandler> toolHandlers) {
        //--- Build one lookup entry for every tool name exposed by each handler
        Map<AgentToolName, AgentToolHandler> indexedHandlers = new EnumMap<>(AgentToolName.class);
        for (AgentToolHandler handler : toolHandlers) {
            for (AgentToolName toolName : handler.toolNames()) {
                AgentToolHandler existingHandler = indexedHandlers.putIfAbsent(toolName, handler);
                if (existingHandler != null) {
                    throw new IllegalStateException("Duplicate agent tool handler registered for " + toolName);
                }
            }
        }
        return Map.copyOf(indexedHandlers);
    }

    private AgentToolExecutionResult skippedTool(AgentToolRequestDTO toolRequest, String reason) {
        //--- Normalize skipped execution so persistence and response rendering stay consistent
        return AgentToolExecutionResult.builder()
                .toolName(toolRequest == null ? null : toolRequest.getToolName())
                .toolType(TOOL_TYPE)
                .status(AgentToolCallStatus.SKIPPED)
                .rationale(toolRequest == null ? null : toolRequest.getRationale())
                .inputJson(toolRequest == null || toolRequest.getArguments() == null
                        ? Map.of()
                        : toolRequest.getArguments())
                .outputJson(Map.of())
                .errorMessage(reason)
                .build();
    }
}
