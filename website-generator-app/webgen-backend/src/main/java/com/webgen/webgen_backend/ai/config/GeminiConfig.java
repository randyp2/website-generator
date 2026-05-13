package com.webgen.webgen_backend.ai.config;

import com.google.genai.Client;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Bean("geminiClient")
    public Client geminiClient(
            @Value("${spring.ai.google.genai.api-key:}") String apiKey,
            @Value("${spring.ai.google.genai.project-id:}") String projectId,
            @Value("${spring.ai.google.genai.location:}") String location,
            @Value("${spring.ai.google.genai.vertex-ai:false}") boolean vertexAi
    ) {
        Client.Builder builder = Client.builder();

        if (apiKey != null && !apiKey.isBlank()) {
            builder.apiKey(apiKey);
        } else {
            if (projectId != null && !projectId.isBlank()) {
                builder.project(projectId);
            }
            if (location != null && !location.isBlank()) {
                builder.location(location);
            }
            builder.vertexAI(vertexAi || (projectId != null && !projectId.isBlank()));
        }

        return builder.build();
    }

    @Bean("geminiStyleChatModel")
    public GoogleGenAiChatModel geminiStyleChatModel(
            @Qualifier("geminiClient") Client geminiClient,
            @Value("${spring.ai.google.genai.style-chat.model}") String model,
            @Value("${spring.ai.google.genai.style-chat.max-output-tokens}") int maxOutputTokens,
            @Value("${spring.ai.google.genai.style-chat.temperature}") double temperature
    ) {
        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .model(model)
                .maxOutputTokens(maxOutputTokens)
                .temperature(temperature)
                .responseMimeType("application/json")
                .build();

        return GoogleGenAiChatModel.builder()
                .genAiClient(geminiClient)
                .defaultOptions(options)
                .build();
    }

    @Bean("geminiPlannerModel")
    public GoogleGenAiChatModel geminiPlannerModel(
            @Qualifier("geminiClient") Client geminiClient,
            @Value("${spring.ai.google.genai.planner.model}") String model,
            @Value("${spring.ai.google.genai.planner.max-output-tokens}") int maxOutputTokens,
            @Value("${spring.ai.google.genai.planner.temperature}") double temperature
    ) {
        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .model(model)
                .maxOutputTokens(maxOutputTokens)
                .temperature(temperature)
                .responseMimeType("application/json")
                .build();

        return GoogleGenAiChatModel.builder()
                .genAiClient(geminiClient)
                .defaultOptions(options)
                .build();
    }

    @Bean("geminiAssetVerificationModel")
    public GoogleGenAiChatModel geminiAssetVerificationModel(
            @Qualifier("geminiClient") Client geminiClient,
            @Value("${spring.ai.google.genai.asset-verification.model}") String model,
            @Value("${spring.ai.google.genai.asset-verification.max-output-tokens}") int maxOutputTokens,
            @Value("${spring.ai.google.genai.asset-verification.temperature}") double temperature
    ) {
        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .model(model)
                .maxOutputTokens(maxOutputTokens)
                .temperature(temperature)
                .responseMimeType("application/json")
                .build();

        return GoogleGenAiChatModel.builder()
                .genAiClient(geminiClient)
                .defaultOptions(options)
                .build();
    }
}
