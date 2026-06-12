package com.webgen.webgen_backend.agent.service.impl;

import com.webgen.webgen_backend.agent.dto.ai.AgentAiRequestDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAiResponseDTO;
import com.webgen.webgen_backend.agent.service.AgentAiClient;
import jakarta.annotation.Resource;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AgentAiClientImpl implements AgentAiClient {

    @Resource(name = "openAiChatModel")
    private ChatModel agentChatModel;

    @Override
    public AgentAiResponseDTO call(AgentAiRequestDTO req) {
        if (req == null || req.getPrompt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prompt is required");
        }

        ChatResponse response = agentChatModel.call(req.getPrompt());
        AssistantMessage assistant = response.getResult().getOutput();
        Usage usage = response.getMetadata().getUsage();

        return AgentAiResponseDTO.builder()
                .assistedText(assistant.getText())
                .model(response.getMetadata().getModel())
                .inputTokens(usage != null ? usage.getPromptTokens() : null)
                .outputTokens(usage != null ? usage.getCompletionTokens() : null)
                .build();
    }
}
