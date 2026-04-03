package com.webgen.webgen_backend.config;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Routes the portfolio blueprint and section models to the correct provider
 * based on the build flag: webgen.ai.portfolio.provider=anthropic|openai
 */
@Configuration
public class PortfolioModelConfig {

    @Configuration
    @ConditionalOnProperty(name = "webgen.ai.portfolio.provider", havingValue = "anthropic")
    static class AnthropicPortfolioModels {

        @Bean("portfolioBlueprintModel")
        public ChatModel blueprintModel(@Qualifier("anthropicBlueprintModel") ChatModel model) {
            return model;
        }

        @Bean("portfolioSectionModel")
        public ChatModel sectionModel(@Qualifier("anthropicSectionModel") ChatModel model) {
            return model;
        }
    }

    @Configuration
    @ConditionalOnProperty(name = "webgen.ai.portfolio.provider", havingValue = "openai")
    static class OpenAiPortfolioModels {

        @Bean("portfolioBlueprintModel")
        public ChatModel blueprintModel(@Qualifier("blueprintModel") ChatModel model) {
            return model;
        }

        @Bean("portfolioSectionModel")
        public ChatModel sectionModel(@Qualifier("sectionModel") ChatModel model) {
            return model;
        }

        @Bean("portfolioSectionRepairModel")
        public ChatModel sectionRepairModel(@Qualifier("sectionRepairModel") ChatModel model) {
            return model;
        }
    }
}
