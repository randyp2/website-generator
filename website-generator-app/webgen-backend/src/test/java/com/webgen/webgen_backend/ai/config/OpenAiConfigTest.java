package com.webgen.webgen_backend.ai.config;

import org.junit.jupiter.api.Test;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class OpenAiConfigTest {

    private final OpenAiConfig config = new OpenAiConfig();
    private final OpenAiApi openAiApi = OpenAiApi.builder()
            .apiKey("test-key")
            .build();

    @Test
    void configuresSolForBlueprintGenerationWithoutTemperature() {
        OpenAiChatModel model = config.blueprintChatModel(
                openAiApi,
                "gpt-5.6-sol",
                10_000,
                "medium"
        );

        OpenAiChatOptions options = (OpenAiChatOptions) model.getDefaultOptions();

        assertThat(options.getModel()).isEqualTo("gpt-5.6-sol");
        assertThat(options.getMaxCompletionTokens()).isEqualTo(10_000);
        assertThat(options.getReasoningEffort()).isEqualTo("medium");
        assertThat(options.getTemperature()).isNull();
    }

    @Test
    void configuresTerraForSectionGenerationWithoutTemperature() {
        OpenAiChatModel model = config.sectionChatModel(
                openAiApi,
                "gpt-5.6-terra",
                20_000,
                "medium"
        );

        OpenAiChatOptions options = (OpenAiChatOptions) model.getDefaultOptions();

        assertThat(options.getModel()).isEqualTo("gpt-5.6-terra");
        assertThat(options.getMaxCompletionTokens()).isEqualTo(20_000);
        assertThat(options.getReasoningEffort()).isEqualTo("medium");
        assertThat(options.getTemperature()).isNull();
    }

    @Test
    void productionPropertiesSelectTheGpt56PortfolioModels() throws IOException {
        Properties properties = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            assertThat(input).isNotNull();
            properties.load(input);
        }

        assertThat(properties.getProperty("spring.ai.openai.blueprint.model"))
                .isEqualTo("gpt-5.6-sol");
        assertThat(properties.getProperty("spring.ai.openai.blueprint.reasoning-effort"))
                .isEqualTo("medium");
        assertThat(properties.getProperty("spring.ai.openai.blueprint.temperature")).isNull();
        assertThat(properties.getProperty("spring.ai.openai.section.model"))
                .isEqualTo("gpt-5.6-terra");
        assertThat(properties.getProperty("spring.ai.openai.section.reasoning-effort"))
                .isEqualTo("medium");
        assertThat(properties.getProperty("spring.ai.openai.section.temperature")).isNull();
    }
}
