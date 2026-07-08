package com.webgen.webgen_backend.portfolio.service.style;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.model.style.CompiledStylePreferences;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import com.webgen.webgen_backend.portfolio.service.parser.StyleChatResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.StyleChatPromptBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Covers the free-form conversation phase (Q4-Q10), specifically the
 * completion contract: the server question counter is the upper bound, but
 * the model can also complete early by returning compiledStylePreferences.
 */
class StyleChatServiceImplTest {

    private StyleChatServiceImpl service;
    private OpenAiChatModel chatModel;
    private StyleContextStore contextStore;
    private UUID portfolioId;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        contextStore = new InMemoryStyleContextStore();
        service = new StyleChatServiceImpl(
                new StyleChatPromptBuilder(objectMapper),
                new StyleChatResponseParser(objectMapper),
                contextStore
        );
        chatModel = mock(OpenAiChatModel.class);
        ReflectionTestUtils.setField(service, "chatModel", chatModel);
        portfolioId = UUID.randomUUID();
    }

    @Test
    void completesEarlyWhenModelReturnsCompiledPreferencesBeforeLastTurn() {
        seedConversationContext(9);
        stubModelResponse("""
                {
                  "assistantMessage": "Great! I have everything I need and I am done asking style questions.",
                  "isAnswerValid": true,
                  "nextQuestionNumber": 10,
                  "suggestions": null,
                  "designTip": null,
                  "previewType": null,
                  "compiledStylePreferences": {
                    "colorScheme": "warm reds",
                    "layoutDensity": "balanced",
                    "tone": "playful",
                    "visualStyle": "illustrations",
                    "sectionEmphasis": "contact",
                    "typography": "Syne / DM Sans",
                    "animationStyle": "dramatic",
                    "whitespace": "balanced",
                    "visualRichness": "expressive",
                    "interactiveElements": "hover effects",
                    "customNotes": "spiderman theme"
                  }
                }
                """);

        StyleChatResponseDTO response = service.chat(conversationRequest("Dramatic"));

        assertTrue(response.isComplete(),
                "compiled preferences from the model should complete the flow before Q10");
        assertNotNull(response.getStylePreferences());
        assertTrue(service.getContext(portfolioId).isStyleDiscoveryComplete());
    }

    @Test
    void completionPrependsDesignGoalToCustomNotes() {
        seedConversationContext(9);
        stubModelResponse("""
                {
                  "assistantMessage": "All done!",
                  "isAnswerValid": true,
                  "nextQuestionNumber": 10,
                  "suggestions": null,
                  "designTip": null,
                  "previewType": null,
                  "compiledStylePreferences": {
                    "colorScheme": "warm reds",
                    "layoutDensity": "balanced",
                    "tone": "playful",
                    "visualStyle": "illustrations",
                    "sectionEmphasis": "contact",
                    "typography": "Syne / DM Sans",
                    "animationStyle": "dramatic",
                    "whitespace": "balanced",
                    "visualRichness": "expressive",
                    "interactiveElements": "hover effects",
                    "customNotes": "comic book panel borders"
                  }
                }
                """);

        StyleChatResponseDTO response = service.chat(conversationRequest("Dramatic"));

        assertEquals(
                "Primary style goal: playful spiderman portfolio | comic book panel borders",
                response.getStylePreferences().get("customNotes"),
                "the user's first message must reach generation verbatim even when the compile model drops it");
    }

    @Test
    void completionDoesNotDuplicateDesignGoalAlreadyInCustomNotes() {
        seedConversationContext(9);
        stubModelResponse("""
                {
                  "assistantMessage": "All done!",
                  "isAnswerValid": true,
                  "nextQuestionNumber": 10,
                  "suggestions": null,
                  "designTip": null,
                  "previewType": null,
                  "compiledStylePreferences": {
                    "colorScheme": "warm reds",
                    "layoutDensity": "balanced",
                    "tone": "playful",
                    "visualStyle": "illustrations",
                    "sectionEmphasis": "contact",
                    "typography": "Syne / DM Sans",
                    "animationStyle": "dramatic",
                    "whitespace": "balanced",
                    "visualRichness": "expressive",
                    "interactiveElements": "hover effects",
                    "customNotes": "User wants a playful spiderman portfolio with comic accents"
                  }
                }
                """);

        StyleChatResponseDTO response = service.chat(conversationRequest("Dramatic"));

        assertEquals(
                "User wants a playful spiderman portfolio with comic accents",
                response.getStylePreferences().get("customNotes"),
                "notes already containing the goal verbatim must not get a duplicate prefix");
    }

    @Test
    void staysIncompleteWhenModelAnswersWithoutCompiledPreferences() {
        seedConversationContext(7);
        stubModelResponse("""
                {
                  "assistantMessage": "Nice! Now, how much whitespace do you want?",
                  "isAnswerValid": true,
                  "nextQuestionNumber": 8,
                  "suggestions": ["Generous", "Balanced", "Tight"],
                  "designTip": null,
                  "previewType": null,
                  "compiledStylePreferences": null
                }
                """);

        StyleChatResponseDTO response = service.chat(conversationRequest("Subtle"));

        assertFalse(response.isComplete());
        assertEquals(8, response.getQuestionNumber());
        assertFalse(service.getContext(portfolioId).isStyleDiscoveryComplete());
    }

    @Test
    void completesOnCounterWhenLastQuestionAnswered() {
        seedConversationContext(10);
        stubModelResponse("""
                {
                  "assistantMessage": "I have everything I need and I am done asking style questions.",
                  "isAnswerValid": true,
                  "nextQuestionNumber": 10,
                  "suggestions": null,
                  "designTip": null,
                  "previewType": null,
                  "compiledStylePreferences": null
                }
                """);

        StyleChatResponseDTO response = service.chat(conversationRequest("Dramatic"));

        assertTrue(response.isComplete());
        assertTrue(service.getContext(portfolioId).isStyleDiscoveryComplete());
    }

    @Test
    void revisionMergesChangedPreferencesAndReturnsComplete() {
        seedCompletedContext();
        stubModelResponse("""
                {
                  "assistantMessage": "Done! Your tone is now **bold** to match the Spiderman energy.",
                  "updatedStylePreferences": {
                    "tone": "bold, high-energy superhero feel",
                    "colorScheme": "",
                    "layoutDensity": "",
                    "visualStyle": "",
                    "sectionEmphasis": "",
                    "typography": "",
                    "animationStyle": "",
                    "whitespace": "",
                    "visualRichness": "",
                    "interactiveElements": "",
                    "customNotes": ""
                  },
                  "suggestions": null
                }
                """);

        StyleChatResponseDTO response = service.chat(conversationRequest("Make the tone bolder"));

        assertTrue(response.isComplete(),
                "an applied revision should re-render as a completed summary");
        assertEquals("bold, high-energy superhero feel",
                response.getStylePreferences().get("tone"));
        assertEquals("playful", response.getStylePreferences().get("visualStyle"),
                "blank fields in the model echo must keep existing values");
        assertEquals(List.of("tone"), response.getUpdatedStyleFields(),
                "only genuinely changed fields should be reported as updated");
    }

    @Test
    void revisionDiscussionLeavesPreferencesUntouched() {
        seedCompletedContext();
        stubModelResponse("""
                {
                  "assistantMessage": "Serif fonts like **Playfair Display** add elegance. Want me to switch?",
                  "updatedStylePreferences": null,
                  "suggestions": ["Switch to serif", "Keep current fonts"]
                }
                """);

        StyleChatResponseDTO response = service.chat(conversationRequest("What about serif fonts?"));

        assertFalse(response.isComplete(),
                "pure discussion must not re-trigger the completion UI");
        assertEquals("playful",
                service.getContext(portfolioId).getCompiledStylePreferences().getVisualStyle());
    }

    /** Places the flow in the post-completion revision phase. */
    private void seedCompletedContext() {
        seedConversationContext(10);
        StyleContext context = service.getContext(portfolioId);
        context.setStyleDiscoveryComplete(true);
        CompiledStylePreferences prefs = new CompiledStylePreferences();
        prefs.setTone("minimal");
        prefs.setVisualStyle("playful");
        context.setCompiledStylePreferences(prefs);
    }

    /** Places the flow mid free-form phase without replaying Q0-Q3. */
    private void seedConversationContext(int currentQuestionNumber) {
        StyleContext context = new StyleContext();
        context.setCurrentQuestionNumber(currentQuestionNumber);
        context.setTotalQuestions(10);
        context.setCurrentQuestion("What animation style do you prefer?");
        context.setDesignGoal("playful spiderman portfolio");
        context.setConversationHistory(new ArrayList<>());
        contextStore.save(portfolioId, context);
    }

    /** Live-object store so tests can seed and inspect contexts directly. */
    private static final class InMemoryStyleContextStore implements StyleContextStore {
        private final Map<UUID, StyleContext> contexts = new HashMap<>();

        @Override
        public StyleContext find(UUID portfolioId) {
            return contexts.get(portfolioId);
        }

        @Override
        public void save(UUID portfolioId, StyleContext context) {
            contexts.put(portfolioId, context);
        }
    }

    private void stubModelResponse(String json) {
        ChatResponse chatResponse = new ChatResponse(
                List.of(new Generation(new AssistantMessage(json)))
        );
        when(chatModel.call(any(Prompt.class))).thenReturn(chatResponse);
    }

    private StyleChatRequestDTO conversationRequest(String userMessage) {
        StyleChatRequestDTO request = new StyleChatRequestDTO();
        request.setPortfolioId(portfolioId);
        request.setUserMessage(userMessage);
        return request;
    }
}
