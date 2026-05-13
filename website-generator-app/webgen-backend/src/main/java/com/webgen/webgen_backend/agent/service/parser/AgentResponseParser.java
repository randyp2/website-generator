package com.webgen.webgen_backend.agent.service.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.ai.AgentAiResponseDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAssistantPayloadDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AgentResponseParser {

    private static final Pattern MARKDOWN_FENCE =
            Pattern.compile("^\\s*```(?:json)?\\s*\\n?(.*?)\\n?\\s*```\\s*$", Pattern.DOTALL);

    private final ObjectMapper objectMapper;

    /**
     * Parses and validates the structured assistant payload returned by the AI client.
     *
     * @param response raw AI client response for the current turn
     * @return validated assistant payload contract
     */
    public AgentAssistantPayloadDTO parseAssistantPayload(AgentAiResponseDTO response) {
        if (response == null || response.getAssistedText() == null || response.getAssistedText().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI client returned empty structured payload");
        }

        AgentAssistantPayloadDTO payload;
        try {
            payload = objectMapper.readValue(stripMarkdownFence(response.getAssistedText()), AgentAssistantPayloadDTO.class);
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "AI client returned invalid JSON payload",
                    exception
            );
        }

        String assistantMessage = payload.getAssistantMessage();
        if (assistantMessage == null || assistantMessage.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI payload missing assistant_message");
        }

        payload.setAssistantMessage(assistantMessage.trim());
        return payload;
    }

    /**
     * Removes optional markdown fences around JSON before deserialization.
     */
    private String stripMarkdownFence(String raw) {
        if (raw == null) {
            return null;
        }
        var matcher = MARKDOWN_FENCE.matcher(raw);
        return matcher.matches() ? matcher.group(1).trim() : raw.trim();
    }
}
