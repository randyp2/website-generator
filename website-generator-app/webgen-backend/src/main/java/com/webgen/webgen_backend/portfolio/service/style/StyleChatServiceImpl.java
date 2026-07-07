package com.webgen.webgen_backend.portfolio.service.style;

import com.webgen.webgen_backend.portfolio.dto.style.StyleColorPresetDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.model.style.CompiledStylePreferences;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import com.webgen.webgen_backend.portfolio.model.style.StyleQAPair;
import com.webgen.webgen_backend.portfolio.service.parser.StyleChatResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.StyleChatPromptBuilder;
import com.webgen.webgen_backend.portfolio.service.style.StyleChatService;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class StyleChatServiceImpl implements StyleChatService {
    private static final Logger log = LoggerFactory.getLogger(StyleChatServiceImpl.class);
    @Resource(name = "styleChatModel")
    private OpenAiChatModel chatModel;
    // @Resource(name = "geminiStyleChatModel")
    // private GoogleGenAiChatModel geminiChatModel;
    private final StyleChatPromptBuilder styleChatPromptBuilder;
    private final StyleChatResponseParser styleChatResponseParser;

    private static final int TOTAL_QUESTIONS = 10;
    private static final int MAX_INVALID_ATTEMPTS_PER_QUESTION = 2;
    private static final Pattern INDECISIVE_PATTERN = Pattern.compile(
            "\\b(i\\s*don'?t\\s*know|idk|not\\s*sure|you\\s*decide|either\\s*is\\s*fine|whatever\\s*you\\s*think)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final List<String> REQUIRED_COLOR_KEYS = List.of(
            "primary",
            "secondary",
            "accent",
            "background",
            "text",
            "muted"
    );
    private static final Pattern HEX_COLOR_PATTERN = Pattern.compile("^#?[0-9a-fA-F]{6}$");

    private static final String DEFAULT_HEADING_FONT = "Space Grotesk";
    private static final String DEFAULT_BODY_FONT = "Inter";

    private final StyleContextStore contextStore;

    @Override
    public StyleChatResponseDTO chat(StyleChatRequestDTO req) {
        if (req == null || req.getPortfolioId() == null)
            throw new IllegalArgumentException("portfolioId is required!");

        // Load or create context; every handler persists it before returning.
        StyleContext context = contextStore.find(req.getPortfolioId());
        if (context == null) {
            context = newContext();
        }

        // After completion the chat becomes a revision loop: user messages can
        // adjust the compiled preferences. Without a message (e.g. a state
        // re-sync) the cached completion is returned unchanged.
        if (context.isStyleDiscoveryComplete()) {
            if (req.getUserMessage() != null && !req.getUserMessage().isBlank()) {
                return handleRevision(req, context);
            }
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

        // Phase 3: Typography selection — user submits font picker selections (Q2 → Q3)
        if (context.getCurrentQuestionNumber() == 2 && req.getFontSelections() != null && !req.getFontSelections().isEmpty()) {
            return handleFontSelection(req, context);
        }

        // Phase 4: Layout selection — user picks a layout style (Q3 → Q4)
        if (context.getCurrentQuestionNumber() == 3 && req.getLayoutSelection() != null && !req.getLayoutSelection().isBlank()) {
            return handleLayoutSelection(req, context);
        }

        // Phase 5: Conversational AI questions (Q4-Q10)
        if (req.getUserMessage() == null || req.getUserMessage().isBlank())
            throw new IllegalArgumentException("userMessage is required!");

        return handleConversation(req, context);
    }

    @Override
    public StyleContext getContext(UUID portfolioId) {
        return contextStore.find(portfolioId);
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
        contextStore.save(req.getPortfolioId(), context);

        // Ask AI for top custom palette recommendations based on the user's goal.
        List<StyleColorPresetDTO> recommendedColorPresets = recommendColorPresets(req.getUserMessage());

        // Build response and show color picker.
        StyleChatResponseDTO dto = new StyleChatResponseDTO();
        String recommendationLine = recommendedColorPresets.isEmpty()
                ? ""
                : " I generated custom palette options for you: **" +
                  recommendedColorPresets.stream()
                          .map(StyleColorPresetDTO::getName)
                          .filter(name -> name != null && !name.isBlank())
                          .reduce((a, b) -> a + "**, **" + b)
                          .orElse("AI Custom Palette") + "**.";
        dto.setAssistantMessage(
                "Great vision! I can already picture it. Now let's pick the colors that'll bring this to life — " +
                "choose a preset palette or customize your own below." + recommendationLine);
        dto.setQuestionNumber(1);
        dto.setTotalQuestions(TOTAL_QUESTIONS);
        dto.setComplete(false);
        dto.setStylePreferences(buildProgressStylePreferences(context));
        dto.setShowColorPicker(true);
        dto.setRecommendedColorPresets(recommendedColorPresets);

        debugContext("THEME GOAL SET", context);
        logResponseDto("theme-goal-return", dto);

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

        // Get AI font recommendations (small focused call)
        StyleChatResponseParser.FontRecommendation fontRec = recommendFonts(context.getDesignGoal());
        String recHeading = fontRec != null ? fontRec.headingFont() : DEFAULT_HEADING_FONT;
        String recBody = fontRec != null ? fontRec.bodyFont() : DEFAULT_BODY_FONT;

        // Advance to Q2 (typography) — deterministic, no conversational LLM call
        context.setCurrentQuestionNumber(2);
        context.setTypographyPickerShown(true);
        context.setCurrentQuestion("Typography selection");
        context.setLastUserMessage(null);
        contextStore.save(req.getPortfolioId(), context);

        // Build response — show typography picker directly
        StyleChatResponseDTO dto = new StyleChatResponseDTO();
        dto.setAssistantMessage(
                "Love that palette! Now let's pick the typography that matches your vision. " +
                "I've pre-selected **" + recHeading + "** for headings and **" + recBody + "** for body text " +
                "based on your style direction — but feel free to explore and pick your own below.");
        dto.setQuestionNumber(2);
        dto.setTotalQuestions(TOTAL_QUESTIONS);
        dto.setComplete(false);
        dto.setShowColorPicker(false);
        dto.setRecommendedColorPresets(null);
        dto.setShowTypographyPicker(true);
        dto.setRecommendedHeadingFont(recHeading);
        dto.setRecommendedBodyFont(recBody);
        dto.setStylePreferences(buildProgressStylePreferences(context));

        debugContext("COLOR SELECTION COMPLETE → TYPOGRAPHY", context);
        logResponseDto("color-selection-return", dto);

        return dto;
    }

    private StyleChatResponseDTO handleFontSelection(StyleChatRequestDTO req, StyleContext context) {
        // Store font selections
        context.setFontSelections(req.getFontSelections());

        // Record as Q&A pair
        StyleQAPair qa = new StyleQAPair();
        qa.setQuestionNumber(2);
        qa.setQuestion("Typography selection");
        qa.setAnswer(formatFontSelections(req.getFontSelections()));
        context.getConversationHistory().add(qa);

        // Advance to Q3 (layout) — deterministic, no LLM call
        context.setCurrentQuestionNumber(3);
        context.setCurrentQuestion("Layout style selection");
        contextStore.save(req.getPortfolioId(), context);

        // Build response — show layout picker directly
        StyleChatResponseDTO dto = new StyleChatResponseDTO();
        dto.setAssistantMessage(
                "Great font combo! Now let's decide how your portfolio is laid out. " +
                "Each layout style creates a different feel:\n\n" +
                "- **Spacious** — generous whitespace, lets each piece breathe\n" +
                "- **Compact** — information-dense, efficient use of space\n" +
                "- **Bento** — modular grid of varied-size cards, visually striking\n" +
                "- **Masonry** — Pinterest-style staggered grid, great for visual work\n" +
                "- **Dynamic** — flexible blocks that adapt based on your content\n\n" +
                "Which layout style fits your portfolio best?");
        dto.setQuestionNumber(3);
        dto.setTotalQuestions(TOTAL_QUESTIONS);
        dto.setComplete(false);
        dto.setShowColorPicker(false);
        dto.setShowTypographyPicker(false);
        dto.setSuggestions(List.of("Spacious", "Compact", "Bento", "Masonry", "Dynamic"));
        dto.setPreviewType("layout_style");
        dto.setDesignTip("Your layout style sets the foundation — it affects how visitors experience every section.");
        dto.setStylePreferences(buildProgressStylePreferences(context));

        debugContext("FONT SELECTION COMPLETE → LAYOUT", context);
        logResponseDto("font-selection-return", dto);

        return dto;
    }

    private StyleChatResponseDTO handleLayoutSelection(StyleChatRequestDTO req, StyleContext context) {
        // Store layout selection
        context.setLayoutSelection(req.getLayoutSelection());

        // Record as Q&A pair
        StyleQAPair qa = new StyleQAPair();
        qa.setQuestionNumber(3);
        qa.setQuestion("Layout style selection");
        qa.setAnswer(req.getLayoutSelection());
        context.getConversationHistory().add(qa);

        // Advance to Q4 — now start the free-form AI conversation
        context.setCurrentQuestionNumber(4);
        context.setLastUserMessage(req.getLayoutSelection());
        contextStore.save(req.getPortfolioId(), context);

        // Call AI for first free-form question (about remaining topics: tone, animations, etc.)
        String layoutMessage = "I selected the " + req.getLayoutSelection() + " layout.";
        Prompt prompt = styleChatPromptBuilder.buildPrompt(layoutMessage, context);
        ChatResponse response = chatModel.call(prompt);
        StyleChatResponseParser.StyleChatParseResult parseResult = styleChatResponseParser.parse(
                response.getResult().getOutput().getText()
        );
        StyleChatResponseDTO parsed = parseResult.response();

        // Update context with AI's question
        context.setCurrentQuestion(parsed.getAssistantMessage());
        contextStore.save(req.getPortfolioId(), context);

        // Build response
        parsed.setQuestionNumber(4);
        parsed.setTotalQuestions(TOTAL_QUESTIONS);
        parsed.setComplete(false);
        parsed.setShowColorPicker(false);
        parsed.setShowTypographyPicker(false);
        parsed.setStylePreferences(buildProgressStylePreferences(context));

        debugContext("LAYOUT SELECTION COMPLETE → FREE-FORM Q4", context);
        logResponseDto("layout-selection-return", parsed);

        return parsed;
    }

    private StyleChatResponseDTO handleConversation(StyleChatRequestDTO req, StyleContext context) {
        context.setLastUserMessage(req.getUserMessage());

        // Build prompt and call AI
        Prompt prompt = styleChatPromptBuilder.buildPrompt(req.getUserMessage(), context);
        ChatResponse response = chatModel.call(prompt);
        StyleChatResponseParser.StyleChatParseResult parseResult = styleChatResponseParser.parse(
                response.getResult().getOutput().getText()
        );
        StyleChatResponseDTO parsed = parseResult.response();

        // Force typography picker and layout off — these are handled deterministically
        parsed.setShowTypographyPicker(false);
        parsed.setRecommendedHeadingFont(null);
        parsed.setRecommendedBodyFont(null);

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
                contextStore.save(req.getPortfolioId(), context);

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

        // Complete when Q10 was just answered, or earlier when the model
        // signals it has everything by returning compiled preferences. The
        // counter stays as the upper bound; compiled preferences are the
        // model's explicit early-completion signal (see StyleChatPromptBuilder).
        boolean modelSignaledCompletion = parseResult.compiledPreferences() != null;
        if (context.getCurrentQuestionNumber() >= TOTAL_QUESTIONS || modelSignaledCompletion) {
            return handleCompletion(req.getPortfolioId(), context, parsed, parseResult.compiledPreferences());
        }

        // Advance to next question server-side
        int nextQuestion = context.getCurrentQuestionNumber() + 1;
        context.setCurrentQuestionNumber(nextQuestion);
        context.setCurrentQuestion(parsed.getAssistantMessage());

        contextStore.save(req.getPortfolioId(), context);

        parsed.setQuestionNumber(nextQuestion);
        parsed.setTotalQuestions(TOTAL_QUESTIONS);
        parsed.setComplete(false);
        parsed.setStylePreferences(buildProgressStylePreferences(context));

        debugContext("Q" + (nextQuestion - 1) + " ANSWERED → moving to Q" + nextQuestion, context);
        logResponseDto("conversation-return", parsed);

        return parsed;
    }

    private StyleChatResponseDTO handleCompletion(
            UUID portfolioId,
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

        // Store layout info into compiled preferences
        if (context.getLayoutSelection() != null) {
            compiled.setLayoutDensity(context.getLayoutSelection());
        }

        context.setCompiledStylePreferences(compiled);
        contextStore.save(portfolioId, context);

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

    /**
     * Revision turn after style discovery completed. When the model applies a
     * change it returns the full preferences object; non-blank fields are
     * merged into the context so a partial echo can never erase existing data.
     * The response is complete only when preferences actually changed, so the
     * frontend re-renders the summary card exactly on applied revisions and
     * keeps plain back-and-forth as regular chat messages.
     */
    private StyleChatResponseDTO handleRevision(StyleChatRequestDTO req, StyleContext context) {
        context.setLastUserMessage(req.getUserMessage());

        Prompt prompt = styleChatPromptBuilder.buildRevisionPrompt(req.getUserMessage(), context);
        ChatResponse response = chatModel.call(prompt);
        StyleChatResponseParser.StyleRevisionParseResult parsed = styleChatResponseParser.parseRevision(
                response.getResult().getOutput().getText()
        );

        boolean preferencesUpdated = parsed.updatedPreferences() != null;
        List<String> updatedFields = List.of();
        if (preferencesUpdated) {
            CompiledStylePreferences base = context.getCompiledStylePreferences() != null
                    ? context.getCompiledStylePreferences()
                    : new CompiledStylePreferences();
            CompiledStylePreferences.MergeResult result =
                    CompiledStylePreferences.mergeNonBlank(base, parsed.updatedPreferences());
            context.setCompiledStylePreferences(result.merged());
            updatedFields = result.changedFields();
        }
        contextStore.save(req.getPortfolioId(), context);

        StyleChatResponseDTO dto = new StyleChatResponseDTO();
        dto.setAssistantMessage(parsed.assistantMessage());
        dto.setQuestionNumber(TOTAL_QUESTIONS);
        dto.setTotalQuestions(TOTAL_QUESTIONS);
        dto.setComplete(preferencesUpdated);
        dto.setSuggestions(parsed.suggestions());
        if (preferencesUpdated) {
            dto.setStylePreferences(compiledToMap(context.getCompiledStylePreferences()));
            dto.setUpdatedStyleFields(updatedFields);
        }

        debugContext(preferencesUpdated ? "REVISION APPLIED" : "REVISION DISCUSSION", context);
        logResponseDto("revision-return", dto);

        return dto;
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
        context.setLayoutSelection(null);
        return context;
    }

    private StyleChatResponseParser.FontRecommendation recommendFonts(String designGoal) {
        try {
            Prompt prompt = styleChatPromptBuilder.buildFontRecommendationPrompt(designGoal);
            ChatResponse response = chatModel.call(prompt);
            String rawJson = response.getResult().getOutput().getText();
            StyleChatResponseParser.FontRecommendation rec = styleChatResponseParser.parseFontRecommendation(rawJson);
            if (rec != null) return rec;
            log.warn("[style-chat] Font recommendation response parsed but produced no valid result");
        } catch (Exception e) {
            log.warn("[style-chat] Failed to generate font recommendations: {}", e.getMessage());
        }
        return new StyleChatResponseParser.FontRecommendation(DEFAULT_HEADING_FONT, DEFAULT_BODY_FONT);
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
        map.put("layoutDensity", context.getLayoutSelection() == null ? "" : context.getLayoutSelection());
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

    private List<StyleColorPresetDTO> recommendColorPresets(String designGoal) {
        try {
            Prompt prompt = styleChatPromptBuilder.buildColorRecommendationPrompt(designGoal);
            ChatResponse response = chatModel.call(prompt);
            String rawJson = response.getResult().getOutput().getText();
            List<StyleColorPresetDTO> parsed = styleChatResponseParser.parseRecommendedColorPresets(rawJson);
            List<StyleColorPresetDTO> normalized = normalizeColorPresets(parsed);
            if (!normalized.isEmpty()) return normalized;
            log.warn("[style-chat] Color recommendation response parsed but produced no valid palettes");
        } catch (Exception e) {
            log.warn("[style-chat] Failed to generate color palette recommendations: {}", e.getMessage());
        }
        return List.of(buildGoalDerivedFallbackPreset(designGoal));
    }

    private List<StyleColorPresetDTO> normalizeColorPresets(List<StyleColorPresetDTO> rawPresets) {
        if (rawPresets == null || rawPresets.isEmpty()) {
            return List.of();
        }

        LinkedHashMap<String, StyleColorPresetDTO> deduped = new LinkedHashMap<>();
        int anonymousCounter = 1;
        for (StyleColorPresetDTO raw : rawPresets) {
            if (raw == null) continue;

            String name = safe(raw.getName()).trim();
            if (name.isBlank()) {
                name = "AI Palette " + anonymousCounter++;
            }
            String dedupeKey = name.toLowerCase(Locale.ROOT);
            if (deduped.containsKey(dedupeKey)) continue;

            Map<String, String> normalizedColors = normalizeColors(raw.getColors());
            if (normalizedColors == null) continue;

            String description = safe(raw.getDescription()).trim();
            if (description.isBlank()) {
                description = "Custom AI-generated palette.";
            }

            deduped.put(
                    dedupeKey,
                    new StyleColorPresetDTO(name, description, normalizedColors)
            );
            if (deduped.size() >= 3) break;
        }

        if (deduped.isEmpty()) return List.of();
        return new ArrayList<>(deduped.values());
    }

    private Map<String, String> normalizeColors(Map<String, String> colors) {
        if (colors == null || colors.isEmpty()) return null;

        LinkedHashMap<String, String> normalized = new LinkedHashMap<>();
        for (String key : REQUIRED_COLOR_KEYS) {
            String raw = colors.get(key);
            String validHex = normalizeHex(raw);
            if (validHex == null) return null;
            normalized.put(key, validHex);
        }

        return normalized;
    }

    private String normalizeHex(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return null;
        if (!HEX_COLOR_PATTERN.matcher(trimmed).matches()) return null;
        return trimmed.startsWith("#")
                ? trimmed.toLowerCase(Locale.ROOT)
                : "#" + trimmed.toLowerCase(Locale.ROOT);
    }

    private StyleColorPresetDTO buildGoalDerivedFallbackPreset(String designGoal) {
        String normalizedGoal = safe(designGoal).trim().toLowerCase(Locale.ROOT);
        int seed = normalizedGoal.isEmpty() ? 97 : Math.abs(normalizedGoal.hashCode());
        double baseHue = seed % 360;
        double secondaryHue = (baseHue + 32) % 360;
        double accentHue = (baseHue + 320) % 360;

        LinkedHashMap<String, String> colors = new LinkedHashMap<>();
        colors.put("primary", hslToHex(baseHue, 0.72, 0.56));
        colors.put("secondary", hslToHex(secondaryHue, 0.66, 0.52));
        colors.put("accent", hslToHex(accentHue, 0.84, 0.60));
        colors.put("background", hslToHex(baseHue, 0.30, 0.10));
        colors.put("text", hslToHex(baseHue, 0.20, 0.95));
        colors.put("muted", hslToHex(baseHue, 0.22, 0.56));

        return new StyleColorPresetDTO(
                "Vision-Tuned Palette",
                "Generated from your design goal for this style direction.",
                colors
        );
    }

    private String hslToHex(double hueDegrees, double saturation, double lightness) {
        double h = ((hueDegrees % 360) + 360) % 360;
        double c = (1 - Math.abs(2 * lightness - 1)) * saturation;
        double x = c * (1 - Math.abs((h / 60.0) % 2 - 1));
        double m = lightness - c / 2.0;

        double rPrime;
        double gPrime;
        double bPrime;

        if (h < 60) {
            rPrime = c;
            gPrime = x;
            bPrime = 0;
        } else if (h < 120) {
            rPrime = x;
            gPrime = c;
            bPrime = 0;
        } else if (h < 180) {
            rPrime = 0;
            gPrime = c;
            bPrime = x;
        } else if (h < 240) {
            rPrime = 0;
            gPrime = x;
            bPrime = c;
        } else if (h < 300) {
            rPrime = x;
            gPrime = 0;
            bPrime = c;
        } else {
            rPrime = c;
            gPrime = 0;
            bPrime = x;
        }

        int red = toRgbChannel(rPrime + m);
        int green = toRgbChannel(gPrime + m);
        int blue = toRgbChannel(bPrime + m);

        return String.format(Locale.ROOT, "#%02x%02x%02x", red, green, blue);
    }

    private int toRgbChannel(double value) {
        int channel = (int) Math.round(value * 255);
        return Math.max(0, Math.min(255, channel));
    }

    private void logResponseDto(String phase, StyleChatResponseDTO dto) {
        log.info(
                "[style-chat:{}] dto assistantMessage={}, showTypographyPicker={}, recommendedHeadingFont={}, recommendedBodyFont={}, suggestions={}, previewType={}, questionNumber={}, isComplete={}",
                phase,
                dto.getAssistantMessage(),
                dto.isShowTypographyPicker(),
                dto.getRecommendedHeadingFont(),
                dto.getRecommendedBodyFont(),
                dto.getSuggestions(),
                dto.getPreviewType(),
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
        sb.append("║  Layout Selection: ").append(context.getLayoutSelection()).append("\n");
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
