package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.prompt.Prompt;

import static org.assertj.core.api.Assertions.assertThat;

class ClarifierPromptBuilderTest {

    @Test
    void restrictsAssistantToPortfolioRefinementRequests() {
        ClarifierPromptBuilder builder = new ClarifierPromptBuilder(new ObjectMapper());

        Prompt prompt = builder.buildPrompt(
                "Write an unrelated essay",
                null,
                new ClarifierContext(),
                null
        );

        String systemMessage = prompt.getInstructions().getFirst().getText();
        assertThat(systemMessage)
                .contains("Discuss only changes to the provided portfolio")
                .contains("Refuse unrelated questions")
                .contains("only help refine this portfolio");
    }
}
