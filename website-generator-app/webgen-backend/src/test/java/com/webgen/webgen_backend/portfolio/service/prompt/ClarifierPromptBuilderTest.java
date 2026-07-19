package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConversationMessage;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClarifierPromptBuilderTest {

    @Test
    void restrictsAssistantToPortfolioRefinementRequests() {
        ClarifierPromptBuilder builder = new ClarifierPromptBuilder(new ObjectMapper());

        Prompt prompt = builder.buildPrompt(
                "Write an unrelated essay",
                null,
                new ClarifierContext(),
                null,
                List.of()
        );

        String systemMessage = prompt.getInstructions().getFirst().getText();
        assertThat(systemMessage)
                .contains("Discuss only changes to the provided portfolio")
                .contains("Refuse unrelated questions")
                .contains("only help refine this portfolio");
    }

    @Test
    void includesBoundedRecentConversationBeforeLatestMessage() {
        ClarifierPromptBuilder builder = new ClarifierPromptBuilder(new ObjectMapper());

        Prompt prompt = builder.buildPrompt(
                "yup",
                null,
                new ClarifierContext(),
                null,
                List.of(
                        new ClarifierConversationMessage(
                                ClarifierConversationMessage.Role.USER,
                                "Change the hero tagline to risk taker"
                        ),
                        new ClarifierConversationMessage(
                                ClarifierConversationMessage.Role.ASSISTANT,
                                "Should the tagline be exactly risk taker?"
                        )
                )
        );

        String userMessage = prompt.getInstructions().getLast().getText();
        assertThat(userMessage)
                .contains("RECENT CONVERSATION")
                .contains("Change the hero tagline to risk taker")
                .contains("Should the tagline be exactly risk taker?")
                .contains("LATEST USER MESSAGE:\nyup");
    }
}
