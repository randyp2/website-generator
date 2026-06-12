package com.webgen.webgen_backend.agent.service.ai.impl;

import com.webgen.webgen_backend.agent.service.ai.AgentAiClient;
import com.webgen.webgen_backend.agent.service.ai.AgentAiRequest;
import com.webgen.webgen_backend.agent.service.ai.AgentAiResponse;
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
        //--- Validate the prompt boundary before calling the model
        if (request == null || request.prompt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prompt is required");
        }

        //--- Execute the Spring AI chat model with the prepared prompt
        ChatResponse response = agentChatModel.call(request.prompt());
        AssistantMessage assistant = response.getResult().getOutput();
        Usage usage = response.getMetadata().getUsage();

        //--- Normalize text, model, and token metadata into the agent AI response
        return new AgentAiResponse(
                assistant.getText(),
                response.getMetadata().getModel(),
                usage != null ? usage.getPromptTokens() : null,
                usage != null ? usage.getCompletionTokens() : null);
    }
}
