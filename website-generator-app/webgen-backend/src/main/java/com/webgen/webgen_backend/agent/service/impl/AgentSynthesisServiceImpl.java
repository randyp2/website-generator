package com.webgen.webgen_backend.agent.service.impl;

import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.service.AgentSynthesisService;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AgentSynthesisServiceImpl implements AgentSynthesisService {

    @Override
    public String synthesize(AgentStructuredPlanDTO plan, List<AgentToolExecutionResult> toolResults) {
        return latestToolAssistantMessage(toolResults, plan.getAssistantMessage());
    }

    private String latestToolAssistantMessage(List<AgentToolExecutionResult> toolResults, String fallbackMessage) {
        if (toolResults == null || toolResults.isEmpty()) {
            return fallbackMessage;
        }

        for (int i = toolResults.size() - 1; i >= 0; i--) {
            AgentToolExecutionResult result = toolResults.get(i);
            if (result == null || result.getStatus() != AgentToolCallStatus.SUCCEEDED) {
                continue;
            }
            Map<String, Object> outputJson = result.getOutputJson();
            Object assistantMessage = outputJson == null ? null : outputJson.get("assistantMessage");
            if (assistantMessage instanceof String message && !message.isBlank()) {
                return message.trim();
            }
        }
        return fallbackMessage;
    }
}
