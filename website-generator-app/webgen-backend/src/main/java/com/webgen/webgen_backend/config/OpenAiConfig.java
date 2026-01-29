package com.webgen.webgen_backend.config;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class OpenAiConfig {

    @Bean
    public OpenAiApi openAiApi(@Value("${spring.ai.openai.api-key}") String apiKey) {
        return OpenAiApi.builder()
                .apiKey(apiKey)
                .build();
    }

    @Bean
    @Primary
    public OpenAiChatModel openAiChatModel(OpenAiApi openAiApi) {
        // Default model for one shot portfolio generation
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model("gpt-5")
                .maxCompletionTokens(20000)
                .temperature(1.0)
                .responseFormat(ResponseFormat.builder().type(ResponseFormat.Type.JSON_OBJECT).build())
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(options)
                .build();

    }

    @Bean("clarifierModel")
    public OpenAiChatModel clarifierChatModel(
            OpenAiApi openAiApi,
            @Value("${spring.ai.openai.clarifier.model}") String model,
            @Value("${spring.ai.openai.clarifier.max-tokens}") int maxTokens,
            @Value("${spring.ai.openai.clarifier.temperature}") double temperature) {

        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .temperature(temperature)
                .responseFormat(ResponseFormat.builder().type(ResponseFormat.Type.JSON_OBJECT).build())
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(options)
                .build();
    }

    @Bean("plannerModel")
    public OpenAiChatModel plannerChatModel(
            OpenAiApi openAiApi,
            @Value("${spring.ai.openai.planner.model}") String model,
            @Value("${spring.ai.openai.planner.max-tokens}") int maxTokens,
            @Value("${spring.ai.openai.planner.temperature}") double temperature) {

        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .temperature(temperature)
                .responseFormat(ResponseFormat.builder().type(ResponseFormat.Type.JSON_OBJECT).build())
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(options)
                .build();
    }

    @Bean("resumeParserModel")
    public OpenAiChatModel resumeParserChatModel(
            OpenAiApi openAiApi,
            @Value("${spring.ai.openai.resume-parser.model}") String model,
            @Value("${spring.ai.openai.resume-parser.max-tokens}") int maxTokens,
            @Value("${spring.ai.openai.resume-parser.temperature}") double temperature) {

        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .maxTokens(maxTokens)
                .temperature(temperature)
                .responseFormat(ResponseFormat.builder().type(ResponseFormat.Type.JSON_OBJECT).build())
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(options)
                .build();
    }
}
