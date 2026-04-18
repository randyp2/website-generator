package com.webgen.webgen_backend.ai.config;

import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class AnthropicConfig {

    @Bean
    public AnthropicApi anthropicApi(@Value("${spring.ai.anthropic.api-key}") String apiKey) {
        return AnthropicApi.builder()
                .apiKey(apiKey)
                .build();
    }

    @Bean("anthropicBlueprintModel")
    public AnthropicChatModel anthropicBlueprintChatModel(
            AnthropicApi anthropicApi,
            @Value("${spring.ai.anthropic.blueprint.model}") String model,
            @Value("${spring.ai.anthropic.blueprint.max-tokens}") int maxTokens,
            @Value("${spring.ai.anthropic.blueprint.temperature}") double temperature) {

        AnthropicChatOptions options = AnthropicChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .temperature(temperature)
                .build();

        return AnthropicChatModel.builder()
                .anthropicApi(anthropicApi)
                .defaultOptions(options)
                .build();
    }

    @Bean("anthropicSectionModel")
    public AnthropicChatModel anthropicSectionChatModel(
            AnthropicApi anthropicApi,
            @Value("${spring.ai.anthropic.section.model}") String model,
            @Value("${spring.ai.anthropic.section.max-tokens}") int maxTokens,
            @Value("${spring.ai.anthropic.section.temperature}") double temperature) {

        AnthropicChatOptions options = AnthropicChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .temperature(temperature)
                .build();

        return AnthropicChatModel.builder()
                .anthropicApi(anthropicApi)
                .defaultOptions(options)
                .build();
    }
}
