package com.webgen.webgen_backend.agent.service.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAiResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AgentResponseParser {

    private static final Pattern MARKDOWN_FENCE =
            Pattern.compile("^\\s*```(?:json)?\\s*\\n?(.*?)\\n?\\s*```\\s*$", Pattern.DOTALL);

    private final ObjectMapper objectMapper;

    public AgentStructuredPlanDTO parseStructuredPlan(AgentAiResponseDTO response) {
        if (response == null || response.getAssistedText() == null || response.getAssistedText().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI client returned empty structured payload");
        }

        AgentStructuredPlanDTO plan;
        try {
            plan = objectMapper.readValue(stripMarkdownFence(response.getAssistedText()), AgentStructuredPlanDTO.class);
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "AI client returned invalid JSON payload",
                    exception);
        }

        if (plan.getAssistantMessage() == null || plan.getAssistantMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI payload missing assistant_message");
        }

        plan.setAssistantMessage(plan.getAssistantMessage().trim());
        if (plan.getToolRequests() == null) {
            plan.setToolRequests(List.of());
        }
        return plan;
    }

    private String stripMarkdownFence(String raw) {
        var matcher = MARKDOWN_FENCE.matcher(raw);
        return matcher.matches() ? matcher.group(1).trim() : raw.trim();
    }
}
