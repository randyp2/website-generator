package com.webgen.webgen_backend.agent.service.impl;

import java.util.HashMap;
import java.util.List;

import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.support.ToolCallbacks;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.model.tool.ToolCallingChatOptions;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.webgen.webgen_backend.agent.dto.ai.AgentAiRequestDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAiResponseDTO;
import com.webgen.webgen_backend.agent.service.AgentAiClient;

import jakarta.annotation.Resource;

@Service
public class AgentAiClientImpl implements AgentAiClient {

    @Resource(name = "openAiChatModel")
    private ChatModel agentChatModel;

    @Override
    public AgentAiResponseDTO call(AgentAiRequestDTO req) {

        if (req == null || req.getPrompt() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prompt is required");

        // --- Create the valid tools to use
        ToolCallback[] callbacks = ToolCallbacks.from(req.getTools().toArray());
        ToolCallingChatOptions options = ToolCallingChatOptions.builder()
                .toolCallbacks(callbacks)
                .toolContext(new HashMap<String, Object>(req.getToolContext()))
                .build();

        // --- Build prompt with tools
        Prompt prompt = Prompt.builder()
                .messages(req.getPrompt().getInstructions())
                .chatOptions(options)
                .build();

        // --- Record response
        ChatResponse response = agentChatModel.call(prompt);
        AssistantMessage assistant = response.getResult().getOutput();
        Usage usage = response.getMetadata().getUsage(); // Metadata of call

        // --- Parse relevant information into DTO
        List<AgentAiResponseDTO.ToolCallDTO> toolCalls = assistant.getToolCalls().stream()
                .map(toolCall -> AgentAiResponseDTO.ToolCallDTO.builder()
                        .toolCallId(toolCall.id())
                        .type(toolCall.type())
                        .toolName(toolCall.name())
                        .arguementsJson(toolCall.arguments())
                        .build())
                .toList();

        return AgentAiResponseDTO.builder()
                .assistedText(assistant.getText())
                .toolCalls(toolCalls)
                .model(response.getMetadata().getModel())
                .inputTokens(usage != null ? usage.getPromptTokens() : null)
                .outputTokens(usage != null ? usage.getCompletionTokens() : null)
                .rawResponse(response)
                .build();
    }
}
