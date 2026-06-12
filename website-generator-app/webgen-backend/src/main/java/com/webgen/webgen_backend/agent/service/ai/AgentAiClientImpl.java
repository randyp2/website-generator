package com.webgen.webgen_backend.agent.service.ai;

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
    public AgentAiResponse call(AgentAiRequest request) {
        if (request == null || request.prompt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prompt is required");
        }

        ChatResponse response = agentChatModel.call(request.prompt());
        AssistantMessage assistant = response.getResult().getOutput();
        Usage usage = response.getMetadata().getUsage();

        return new AgentAiResponse(
                assistant.getText(),
                response.getMetadata().getModel(),
                usage != null ? usage.getPromptTokens() : null,
                usage != null ? usage.getCompletionTokens() : null);
    }
}
