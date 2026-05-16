package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import com.webgen.webgen_backend.shared.prompt.PromptTemplateLoader;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StyleChatPromptBuilder {
    private final ObjectMapper objectMapper;
    private final PromptTemplateLoader promptTemplateLoader;

    private static final String COLOR_RECOMMENDATION_SYSTEM_TEMPLATE_PATH =
            "prompts/portfolio/style-chat-color-recommendation-system.md";
    private static final String FONT_RECOMMENDATION_SYSTEM_TEMPLATE_PATH =
            "prompts/portfolio/style-chat-font-recommendation-system.md";
    private static final String CONVERSATION_SYSTEM_TEMPLATE_PATH =
            "prompts/portfolio/style-chat-conversation-system.md";

    public Prompt buildColorRecommendationPrompt(String designGoal) {
        SystemMessage system = new SystemMessage(
                promptTemplateLoader.load(COLOR_RECOMMENDATION_SYSTEM_TEMPLATE_PATH)
        );

        UserMessage user = new UserMessage("""
                User design goal:
                %s

                Generate 3 custom color presets and return JSON only.
                """.formatted(safe(designGoal)));

        return new Prompt(List.of(system, user));
    }

    public Prompt buildFontRecommendationPrompt(String designGoal) {
        SystemMessage system = new SystemMessage(
                promptTemplateLoader.load(FONT_RECOMMENDATION_SYSTEM_TEMPLATE_PATH)
        );

        UserMessage user = new UserMessage("""
                User design goal:
                %s

                Recommend a heading font and body font. Return JSON only.
                """.formatted(safe(designGoal)));

        return new Prompt(List.of(system, user));
    }

    public Prompt buildPrompt(String userMessage, StyleContext context) {
        String contextJson = safeJson(context);

        String decidedChoices = buildDecidedChoicesSummary(context);

        String systemTemplate = promptTemplateLoader.load(CONVERSATION_SYSTEM_TEMPLATE_PATH);
        SystemMessage system = new SystemMessage(systemTemplate.formatted(
                context.getCurrentQuestionNumber(),
                context.getTotalQuestions(),
                safe(context.getDesignGoal()),
                decidedChoices,
                context.getTotalQuestions(),
                context.getTotalQuestions()
        ));

        UserMessage user = new UserMessage("""
                STYLE CONTEXT:
                %s

                USER'S DESIGN GOAL:
                %s

                CONVERSATION SO FAR:
                %s

                YOU LAST ASKED:
                %s

                USER SAYS:
                %s

                Continue the design conversation naturally. Reference the user's design goal when relevant. Return JSON only.
                """.formatted(
                contextJson,
                safe(context.getDesignGoal()),
                safeJson(context.getConversationHistory()),
                safe(context.getCurrentQuestion()),
                safe(userMessage)
        ));

        return new Prompt(List.of(system, user));
    }

    private String buildDecidedChoicesSummary(StyleContext context) {
        StringBuilder sb = new StringBuilder();
        sb.append("- Colors: ").append(
                context.getColorSelections() != null
                        ? context.getColorSelections().toString()
                        : "not yet chosen"
        ).append("\n");
        sb.append("- Typography: ").append(
                context.getFontSelections() != null
                        ? "heading=" + context.getFontSelections().get("heading")
                          + ", body=" + context.getFontSelections().get("body")
                        : "not yet chosen"
        ).append("\n");
        sb.append("- Layout: ").append(
                context.getLayoutSelection() != null
                        ? context.getLayoutSelection()
                        : "not yet chosen"
        );
        return sb.toString();
    }

    private String safe(String text) {
        return text == null ? "" : text;
    }

    private String safeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
