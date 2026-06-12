package com.webgen.webgen_backend.agent.service.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.service.ai.AgentAiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AgentResponseParser {

    private static final Pattern MARKDOWN_FENCE =
            Pattern.compile("^\\s*```(?:json)?\\s*\\n?(.*?)\\n?\\s*```\\s*$", Pattern.DOTALL);

    private final ObjectMapper objectMapper;

    public AgentStructuredPlanDTO parseStructuredPlan(AgentAiResponse response) {
        //--- Require a non-empty model payload before JSON parsing
        if (response == null || response.assistedText() == null || response.assistedText().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI client returned empty structured payload");
        }

        //--- Parse the planner payload after removing optional markdown fences
        AgentStructuredPlanDTO plan;
        try {
            plan = objectMapper.readValue(stripMarkdownFence(response.assistedText()), AgentStructuredPlanDTO.class);
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "AI client returned invalid JSON payload",
                    exception);
        }

        //--- Enforce the minimum response contract needed by the frontend
        if (plan.getAssistantMessage() == null || plan.getAssistantMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI payload missing assistant_message");
        }

        //--- Normalize optional fields so orchestration can treat them consistently
        plan.setAssistantMessage(plan.getAssistantMessage().trim());
        if (plan.getToolRequests() == null) {
            plan.setToolRequests(List.of());
        }
        return plan;
    }

    private String stripMarkdownFence(String raw) {
        //--- Accept raw JSON or a single fenced JSON block from the model
        Matcher matcher = MARKDOWN_FENCE.matcher(raw);
        return matcher.matches() ? matcher.group(1).trim() : raw.trim();
    }
}
