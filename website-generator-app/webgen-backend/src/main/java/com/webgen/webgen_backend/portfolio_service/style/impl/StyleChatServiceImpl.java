package com.webgen.webgen_backend.portfolio_service.style.impl;

import com.webgen.webgen_backend.dto.portfolio.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.model.portfolio.style.CompiledStylePreferences;
import com.webgen.webgen_backend.model.portfolio.style.StyleContext;
import com.webgen.webgen_backend.model.portfolio.style.StyleQAPair;
import com.webgen.webgen_backend.portfolio_service.parser.StyleChatResponseParser;
import com.webgen.webgen_backend.portfolio_service.prompt.StyleChatPromptBuilder;
import com.webgen.webgen_backend.portfolio_service.style.StyleChatService;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class StyleChatServiceImpl implements StyleChatService {
    private static final Logger log = LoggerFactory.getLogger(StyleChatServiceImpl.class);
    @Resource(name = "styleChatModel")
    private OpenAiChatModel openAiChatModel;
    private final StyleChatPromptBuilder styleChatPromptBuilder;
    private final StyleChatResponseParser styleChatResponseParser;

    private static final int TOTAL_QUESTIONS = 10;
    private static final int MAX_INVALID_ATTEMPTS_PER_QUESTION = 2;
    private static final Pattern INDECISIVE_PATTERN = Pattern.compile(
            "\\b(i\\s*don'?t\\s*know|idk|not\\s*sure|you\\s*decide|either\\s*is\\s*fine|whatever\\s*you\\s*think)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // In memory context store (swap for DB/Redis later)
    private final Map<UUID, StyleContext> contextStore = new ConcurrentHashMap<>();

    @Override
    public StyleChatResponseDTO chat(StyleChatRequestDTO req) {
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId is required!");

        // Load or create context
        StyleContext context = contextStore.computeIfAbsent(
                req.getPortfolioId(),
                id -> newContext()
        );

        // If already complete, return cached result
        if (context.isStyleDiscoveryComplete()) {
            return buildCompleteResponse(context);
        }

        // Phase 1: Theme goal — user describes their design vision (Q0 → Q1)
        if (context.getCurrentQuestionNumber() == 0 && req.getUserMessage() != null && !req.getUserMessage().isBlank()) {
            return handleThemeGoal(req, context);
        }

        // Phase 2: Color selection — user submits color picker selections (Q1 → Q2)
        if (context.getCurrentQuestionNumber() == 1 && req.getColorSelections() != null) {
            return handleColorSelection(req, context);
        }

        // Font selection — user submits typography picker selections
        if (req.getFontSelections() != null && !req.getFontSelections().isEmpty()) {
            return handleFontSelection(req, context);
        }

        // Phase 3: Conversational AI questions (Q2-Q10)
        if (req.getUserMessage() == null || req.getUserMessage().isBlank())
            throw new IllegalArgumentException("userMessage is required!");

        return handleConversation(req, context);
    }

    @Override
    public StyleContext getContext(UUID portfolioId) {
        return contextStore.get(portfolioId);
    }

    private StyleChatResponseDTO handleThemeGoal(StyleChatRequestDTO req, StyleContext context) {
        // Store the user's design goal
        context.setDesignGoal(req.getUserMessage());
        context.setCurrentQuestionNumber(1);

        // Record as Q&A pair
        StyleQAPair q0 = new StyleQAPair();
        q0.setQuestionNumber(0);
        q0.setQuestion("Design theme / goal");
        q0.setAnswer(req.getUserMessage());
        context.getConversationHistory().add(q0);

        context.setLastUserMessage(req.getUserMessage());
        contextStore.put(req.getPortfolioId(), context);

        // Build response — no AI call needed, just acknowledge and show color picker
        StyleChatResponseDTO dto = new StyleChatResponseDTO();
        dto.setAssistantMessage(
                "Great vision! I can already picture it. Now let's pick the colors that'll bring this to life — " +
                "choose a preset palette or customize your own below.");
        dto.setQuestionNumber(1);
        dto.setTotalQuestions(TOTAL_QUESTIONS);
        dto.setComplete(false);
        dto.setStylePreferences(buildProgressStylePreferences(context));
        dto.setShowColorPicker(true);

        debugContext("THEME GOAL SET", context);

        return dto;
    }

    private StyleChatResponseDTO handleColorSelection(StyleChatRequestDTO req, StyleContext context) {
        // Store color selections
        context.setColorSelections(req.getColorSelections());

        // Record as Q&A pair
        StyleQAPair q1 = new StyleQAPair();
        q1.setQuestionNumber(1);
        q1.setQuestion("Color palette selection");
        q1.setAnswer(formatColorSelections(req.getColorSelections()));
        context.getConversationHistory().add(q1);

        // Call AI to generate first conversational question, with both designGoal AND colors in context
        Prompt prompt = styleChatPromptBuilder.buildFirstQuestionPrompt(context);
        ChatResponse response = openAiChatModel.call(prompt);
        StyleChatResponseParser.StyleChatParseResult parseResult = styleChatResponseParser.parse(
                response.getResult().getOutput().getText()
        );
        StyleChatResponseDTO parsed = parseResult.response();
        logTypographyRecommendationState("first-question", parsed);

        // Advance to question 2
        context.setCurrentQuestionNumber(2);
        context.setCurrentQuestion(parsed.getAssistantMessage());
        context.setLastUserMessage(null);

        contextStore.put(req.getPortfolioId(), context);

        // Track typography picker if AI triggered it in the first question
        if (parsed.isShowTypographyPicker()) {
            context.setTypographyPickerShown(true);
            contextStore.put(req.getPortfolioId(), context);
        }

        // Build response
        parsed.setQuestionNumber(2);
        parsed.setTotalQuestions(TOTAL_QUESTIONS);
        parsed.setComplete(false);
        parsed.setStylePreferences(buildProgressStylePreferences(context));
        parsed.setShowColorPicker(false);

        debugContext("COLOR SELECTION COMPLETE", context);
        logResponseDto("color-selection-return", parsed);

        return parsed;
    }

    private StyleChatResponseDTO handleFontSelection(StyleChatRequestDTO req, StyleContext context) {
        // Store font selections
        context.setFontSelections(req.getFontSelections());
        context.setTypographyPickerShown(true);

        // Record as Q&A pair
        StyleQAPair qa = new StyleQAPair();
        qa.setQuestionNumber(context.getCurrentQuestionNumber());
        qa.setQuestion("Typography selection");
        qa.setAnswer(formatFontSelections(req.getFontSelections()));
        context.getConversationHistory().add(qa);

        // Call AI to continue the conversation after font selection
        String fontMessage = "I selected these fonts: " + formatFontSelections(req.getFontSelections());
        Prompt prompt = styleChatPromptBuilder.buildPrompt(fontMessage, context);
        ChatResponse response = openAiChatModel.call(prompt);
        StyleChatResponseParser.StyleChatParseResult parseResult = styleChatResponseParser.parse(
                response.getResult().getOutput().getText()
        );
        StyleChatResponseDTO parsed = parseResult.response();
        logTypographyRecommendationState("font-selection-followup", parsed);

        // Advance to next question
        int nextQuestion = context.getCurrentQuestionNumber() + 1;
        context.setCurrentQuestionNumber(nextQuestion);
        context.setCurrentQuestion(parsed.getAssistantMessage());

        contextStore.put(req.getPortfolioId(), context);

        parsed.setQuestionNumber(nextQuestion);
        parsed.setTotalQuestions(TOTAL_QUESTIONS);
        parsed.setComplete(false);
        parsed.setStylePreferences(buildProgressStylePreferences(context));
        parsed.setShowTypographyPicker(false);

        debugContext("FONT SELECTION COMPLETE", context);
        logResponseDto("font-selection-return", parsed);

        return parsed;
    }

    private StyleChatResponseDTO handleConversation(StyleChatRequestDTO req, StyleContext context) {
        context.setLastUserMessage(req.getUserMessage());

        // Build prompt and call AI
        Prompt prompt = styleChatPromptBuilder.buildPrompt(req.getUserMessage(), context);
        ChatResponse response = openAiChatModel.call(prompt);
        StyleChatResponseParser.StyleChatParseResult parseResult = styleChatResponseParser.parse(
                response.getResult().getOutput().getText()
        );
        StyleChatResponseDTO parsed = parseResult.response();
        logTypographyRecommendationState("conversation", parsed);

        // Track typography picker state: if AI wants to show it and it hasn't been shown yet, mark it
        if (parsed.isShowTypographyPicker() && !context.isTypographyPickerShown()) {
            context.setTypographyPickerShown(true);
        } else {
            // Prevent re-triggering if already shown
            parsed.setShowTypographyPicker(false);
        }

        boolean answerValid = parseResult.answerValid();
        boolean provisionalAdvance = false;
        boolean indecisiveReply = isIndecisiveReply(req.getUserMessage());

        // Treat indecision as progress to avoid dead-ends in the flow.
        if (!answerValid && indecisiveReply) {
            answerValid = true;
            provisionalAdvance = true;
        }

        if (!answerValid) {
            int invalidAttempts = context.getInvalidAttemptsForCurrentQuestion() + 1;
            context.setInvalidAttemptsForCurrentQuestion(invalidAttempts);

            if (invalidAttempts >= MAX_INVALID_ATTEMPTS_PER_QUESTION) {
                provisionalAdvance = true;
                answerValid = true;
                context.setInvalidAttemptsForCurrentQuestion(0);
                parsed.setAssistantMessage(
                        "No problem, I'll make a reasonable default for now so we can keep moving. " +
                        parsed.getAssistantMessage()
                );
            } else {
                contextStore.put(req.getPortfolioId(), context);

                // Do NOT advance - return redirect message at same question number
                parsed.setQuestionNumber(context.getCurrentQuestionNumber());
                parsed.setTotalQuestions(TOTAL_QUESTIONS);
                parsed.setComplete(false);
                parsed.setStylePreferences(buildProgressStylePreferences(context));

                debugContext("INVALID ANSWER at Q" + context.getCurrentQuestionNumber(), context);
                logResponseDto("invalid-answer-return", parsed);

                return parsed;
            }
        }

        context.setInvalidAttemptsForCurrentQuestion(0);

        // Valid answer - record Q&A pair
        StyleQAPair qa = new StyleQAPair();
        qa.setQuestionNumber(context.getCurrentQuestionNumber());
        qa.setQuestion(context.getCurrentQuestion());
        qa.setAnswer(provisionalAdvance
                ? req.getUserMessage() + " (provisional preference used to keep flow moving)"
                : req.getUserMessage());
        context.getConversationHistory().add(qa);

        // Check if Q10 just answered (completion)
        if (context.getCurrentQuestionNumber() >= TOTAL_QUESTIONS) {
            return handleCompletion(context, parsed, parseResult.compiledPreferences());
        }

        // Advance to next question server-side
        int nextQuestion = context.getCurrentQuestionNumber() + 1;
        context.setCurrentQuestionNumber(nextQuestion);
        context.setCurrentQuestion(parsed.getAssistantMessage());

        contextStore.put(req.getPortfolioId(), context);

        parsed.setQuestionNumber(nextQuestion);
        parsed.setTotalQuestions(TOTAL_QUESTIONS);
        parsed.setComplete(false);
        parsed.setStylePreferences(buildProgressStylePreferences(context));

        debugContext("Q" + (nextQuestion - 1) + " ANSWERED → moving to Q" + nextQuestion, context);
        logResponseDto("conversation-return", parsed);

        return parsed;
    }

    private StyleChatResponseDTO handleCompletion(
            StyleContext context,
            StyleChatResponseDTO parsed,
            CompiledStylePreferences parsedCompiledPreferences
    ) {
        context.setStyleDiscoveryComplete(true);

        // Get compiled preferences from AI response
        CompiledStylePreferences compiled = parsedCompiledPreferences;
        if (compiled == null) {
            // Fallback: create from conversation history
            compiled = new CompiledStylePreferences();
            compiled.setCustomNotes("Style preferences gathered from conversation");
        }

        // Store color info from Q1 into compiled preferences
        if (context.getColorSelections() != null) {
            compiled.setColorScheme(formatColorSelections(context.getColorSelections()));
        }

        // Store font info into compiled preferences
        if (context.getFontSelections() != null) {
            compiled.setTypography(formatFontSelections(context.getFontSelections()));
        }

        context.setCompiledStylePreferences(compiled);

        // Convert compiled preferences to Map<String, String>
        Map<String, String> stylePrefsMap = compiledToMap(compiled);

        parsed.setQuestionNumber(TOTAL_QUESTIONS);
        parsed.setTotalQuestions(TOTAL_QUESTIONS);
        parsed.setComplete(true);
        parsed.setAssistantMessage(
                safe(parsed.getAssistantMessage())
        );
        parsed.setStylePreferences(stylePrefsMap);

        debugContext("STYLE DISCOVERY COMPLETE", context);
        logResponseDto("completion-return", parsed);

        return parsed;
    }

    private StyleChatResponseDTO buildCompleteResponse(StyleContext context) {
        StyleChatResponseDTO dto = new StyleChatResponseDTO();
        dto.setAssistantMessage("Your style profile is already complete!");
        dto.setQuestionNumber(TOTAL_QUESTIONS);
        dto.setTotalQuestions(TOTAL_QUESTIONS);
        dto.setComplete(true);
        dto.setStylePreferences(compiledToMap(context.getCompiledStylePreferences()));
        logResponseDto("already-complete-return", dto);
        return dto;
    }

    private StyleContext newContext() {
        StyleContext context = new StyleContext();
        context.setCurrentQuestionNumber(0);
        context.setTotalQuestions(TOTAL_QUESTIONS);
        context.setStyleDiscoveryComplete(false);
        context.setCurrentQuestion(null);
        context.setDesignGoal(null);
        context.setColorSelections(null);
        context.setConversationHistory(new ArrayList<>());
        context.setCompiledStylePreferences(null);
        context.setLastUserMessage(null);
        context.setInvalidAttemptsForCurrentQuestion(0);
        context.setFontSelections(null);
        context.setTypographyPickerShown(false);
        return context;
    }

    private boolean isIndecisiveReply(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) return false;
        return INDECISIVE_PATTERN.matcher(userMessage).find();
    }

    private String formatFontSelections(Map<String, String> fonts) {
        if (fonts == null || fonts.isEmpty()) return "none";
        return fonts.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .reduce((a, b) -> a + ", " + b)
                .orElse("none");
    }

    private String formatColorSelections(Map<String, String> colors) {
        if (colors == null || colors.isEmpty()) return "none";
        return colors.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .reduce((a, b) -> a + ", " + b)
                .orElse("none");
    }

    private Map<String, String> buildProgressStylePreferences(StyleContext context) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("colorScheme", context.getColorSelections() == null ? "" : formatColorSelections(context.getColorSelections()));
        map.put("layoutDensity", "");
        map.put("tone", "");
        map.put("visualStyle", "");
        map.put("sectionEmphasis", "");
        map.put("typography", context.getFontSelections() == null ? "" : formatFontSelections(context.getFontSelections()));
        map.put("animationStyle", "");
        map.put("whitespace", "");
        map.put("imageryStyle", "");
        map.put("interactiveElements", "");
        map.put("customNotes", buildProgressNotes(context));
        return map;
    }

    private String buildProgressNotes(StyleContext context) {
        StringBuilder notes = new StringBuilder();
        if (context.getDesignGoal() != null && !context.getDesignGoal().isBlank()) {
            notes.append("Primary style goal: ").append(context.getDesignGoal().trim());
        }

        List<StyleQAPair> history = context.getConversationHistory();
        if (history != null && !history.isEmpty()) {
            for (StyleQAPair qa : history) {
                if (qa == null || qa.getAnswer() == null || qa.getAnswer().isBlank()) continue;
                if (qa.getQuestionNumber() <= 1) continue; // q0/q1 already represented above
                if (!notes.isEmpty()) notes.append(" | ");
                notes.append("Q").append(qa.getQuestionNumber()).append(": ").append(qa.getAnswer().trim());
            }
        }

        return notes.toString();
    }

    private Map<String, String> compiledToMap(CompiledStylePreferences prefs) {
        if (prefs == null) return new HashMap<>();
        Map<String, String> map = new LinkedHashMap<>();
        map.put("colorScheme", safe(prefs.getColorScheme()));
        map.put("layoutDensity", safe(prefs.getLayoutDensity()));
        map.put("tone", safe(prefs.getTone()));
        map.put("visualStyle", safe(prefs.getVisualStyle()));
        map.put("sectionEmphasis", safe(prefs.getSectionEmphasis()));
        map.put("typography", safe(prefs.getTypography()));
        map.put("animationStyle", safe(prefs.getAnimationStyle()));
        map.put("whitespace", safe(prefs.getWhitespace()));
        map.put("imageryStyle", safe(prefs.getImageryStyle()));
        map.put("interactiveElements", safe(prefs.getInteractiveElements()));
        map.put("customNotes", safe(prefs.getCustomNotes()));
        return map;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private void logTypographyRecommendationState(String phase, StyleChatResponseDTO parsed) {
        log.info(
                "[style-chat:{}] showTypographyPicker={}, recommendedHeadingFont={}, recommendedBodyFont={}",
                phase,
                parsed.isShowTypographyPicker(),
                parsed.getRecommendedHeadingFont(),
                parsed.getRecommendedBodyFont()
        );
    }

    private void logResponseDto(String phase, StyleChatResponseDTO dto) {
        log.info(
                "[style-chat:{}] dto assistantMessage={}, showTypographyPicker={}, recommendedHeadingFont={}, recommendedBodyFont={}, questionNumber={}, isComplete={}",
                phase,
                dto.getAssistantMessage(),
                dto.isShowTypographyPicker(),
                dto.getRecommendedHeadingFont(),
                dto.getRecommendedBodyFont(),
                dto.getQuestionNumber(),
                dto.isComplete()
        );
    }

    private void debugContext(String label, StyleContext context) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n╔══════════════════════════════════════════════════════════╗\n");
        sb.append("║  STYLE CONTEXT DEBUG: ").append(label).append("\n");
        sb.append("╠══════════════════════════════════════════════════════════╣\n");
        sb.append("║  Question: ").append(context.getCurrentQuestionNumber())
          .append(" / ").append(context.getTotalQuestions()).append("\n");
        sb.append("║  Complete: ").append(context.isStyleDiscoveryComplete()).append("\n");
        sb.append("║  Current Q: ").append(context.getCurrentQuestion()).append("\n");
        sb.append("║  Last User Msg: ").append(context.getLastUserMessage()).append("\n");
        sb.append("║  Design Goal: ").append(context.getDesignGoal()).append("\n");
        sb.append("║  Color Selections: ").append(context.getColorSelections()).append("\n");
        sb.append("║  Font Selections: ").append(context.getFontSelections()).append("\n");
        sb.append("║  Typography Picker Shown: ").append(context.isTypographyPickerShown()).append("\n");
        sb.append("║  Invalid Attempts (current question): ")
          .append(context.getInvalidAttemptsForCurrentQuestion()).append("\n");
        sb.append("║  Conversation History (").append(context.getConversationHistory().size()).append(" entries):\n");
        for (StyleQAPair qa : context.getConversationHistory()) {
            sb.append("║    Q").append(qa.getQuestionNumber())
              .append(": ").append(qa.getQuestion()).append("\n");
            sb.append("║    A").append(qa.getQuestionNumber())
              .append(": ").append(qa.getAnswer()).append("\n");
        }
        if (context.getCompiledStylePreferences() != null) {
            sb.append("║  Compiled Preferences: ").append(compiledToMap(context.getCompiledStylePreferences())).append("\n");
        }
        sb.append("╚══════════════════════════════════════════════════════════╝");
        log.info(sb.toString());
    }
}
