package com.webgen.webgen_backend.agent.config;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AgentAiConfig {

    @Bean("agentOrchestratorChatModel")
    public OpenAiChatModel agentOrchestratorChatModel(
            OpenAiApi openAiApi,
            @Value("${spring.ai.openai.agent-orchestrator.model}") String model,
            @Value("${spring.ai.openai.agent-orchestrator.max-completion-tokens}") int maxCompletionTokens,
            @Value("${spring.ai.openai.agent-orchestrator.temperature}") double temperature) {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .maxCompletionTokens(maxCompletionTokens)
                .temperature(temperature)
                .responseFormat(ResponseFormat.builder().type(ResponseFormat.Type.JSON_OBJECT).build())
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(options)
                .build();
    }
}
