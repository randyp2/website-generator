package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import com.webgen.webgen_backend.shared.util.PromptResourceLoader;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Assembles the style discovery prompts. Prompt text lives in
 * resources/prompts/style/*.md; this class only supplies the runtime values.
 * The system prompt's completion rules (3-5) form a contract with
 * StyleChatServiceImpl: returning compiledStylePreferences is the model's
 * explicit early-completion signal.
 */
@Service
@RequiredArgsConstructor
public class StyleChatPromptBuilder {
    private static final String PROMPT_DIR = "prompts/style/";

    private final ObjectMapper objectMapper;

    public Prompt buildColorRecommendationPrompt(String designGoal) {
        SystemMessage system = new SystemMessage(
                PromptResourceLoader.load(PROMPT_DIR + "color-recommendation-system.md"));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "color-recommendation-user.md",
                Map.of("designGoal", safe(designGoal))));

        return new Prompt(List.of(system, user));
    }

    public Prompt buildFontRecommendationPrompt(String designGoal) {
        SystemMessage system = new SystemMessage(
                PromptResourceLoader.load(PROMPT_DIR + "font-recommendation-system.md"));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "font-recommendation-user.md",
                Map.of("designGoal", safe(designGoal))));

        return new Prompt(List.of(system, user));
    }

    public Prompt buildPrompt(String userMessage, StyleContext context) {
        SystemMessage system = new SystemMessage(PromptResourceLoader.render(
                PROMPT_DIR + "style-chat-system.md",
                Map.of(
                        "currentTurn", String.valueOf(context.getCurrentQuestionNumber()),
                        "totalQuestions", String.valueOf(context.getTotalQuestions()),
                        "designGoal", safe(context.getDesignGoal()),
                        "decidedChoices", buildDecidedChoicesSummary(context)
                )));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "style-chat-user.md",
                Map.of(
                        "styleContext", safeJson(context),
                        "designGoal", safe(context.getDesignGoal()),
                        "conversationHistory", safeJson(context.getConversationHistory()),
                        "lastQuestion", safe(context.getCurrentQuestion()),
                        "userMessage", safe(userMessage)
                )));

        return new Prompt(List.of(system, user));
    }

    /**
     * Post-completion revision turn: the model sees the compiled preferences as
     * the source of truth and either applies a requested change (returning the
     * full updated object) or answers without changing anything.
     */
    public Prompt buildRevisionPrompt(String userMessage, StyleContext context) {
        SystemMessage system = new SystemMessage(PromptResourceLoader.render(
                PROMPT_DIR + "style-revision-system.md",
                Map.of(
                        "designGoal", safe(context.getDesignGoal()),
                        "currentPreferences", safeJson(context.getCompiledStylePreferences())
                )));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "style-revision-user.md",
                Map.of("userMessage", safe(userMessage))));

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
