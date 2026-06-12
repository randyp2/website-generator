package com.webgen.webgen_backend.agent.tools.recommendstylepalette;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.dto.common.AgentToolName;
import com.webgen.webgen_backend.agent.dto.common.AgentToolRequestDTO;
import com.webgen.webgen_backend.agent.dto.tool.recommendstylepalette.RecommendStylePaletteToolInputDTO;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
import com.webgen.webgen_backend.agent.tools.AgentToolHandler;
import com.webgen.webgen_backend.agent.tools.style.AgentStyleMemoryStore;
import com.webgen.webgen_backend.portfolio.dto.style.StyleColorPresetDTO;
import com.webgen.webgen_backend.portfolio.service.parser.StyleChatResponseParser;
import com.webgen.webgen_backend.portfolio.service.prompt.StyleChatPromptBuilder;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class AgentRecommendStylePaletteToolHandler implements AgentToolHandler {

    private static final Logger log = LoggerFactory.getLogger(AgentRecommendStylePaletteToolHandler.class);
    private static final String TOOL_TYPE = "structured_output";
    private static final String DEFAULT_HEADING_FONT = "Space Grotesk";
    private static final String DEFAULT_BODY_FONT = "Inter";
    private static final List<String> REQUIRED_COLOR_KEYS = List.of(
            "primary",
            "secondary",
            "accent",
            "background",
            "text",
            "muted");
    private static final Pattern HEX_COLOR_PATTERN = Pattern.compile("^#?[0-9a-fA-F]{6}$");

    @Resource(name = "geminiStyleChatModel")
    private GoogleGenAiChatModel geminiChatModel;

    private final AgentStyleMemoryStore agentStyleMemoryStore;
    private final StyleChatPromptBuilder styleChatPromptBuilder;
    private final StyleChatResponseParser styleChatResponseParser;
    private final ObjectMapper objectMapper;

    @Override
    public Set<AgentToolName> toolNames() {
        return Set.of(AgentToolName.RECOMMEND_STYLE_PALETTE);
    }

    @Override
    public AgentToolExecutionResult execute(UUID portfolioId, AgentToolRequestDTO toolRequest) {
        //--- Resolve design goal from tool input first, then durable style memory
        Map<String, Object> inputJson = toolRequest.getArguments() == null
                ? Map.of()
                : toolRequest.getArguments();
        RecommendStylePaletteToolInputDTO input = objectMapper.convertValue(
                inputJson,
                RecommendStylePaletteToolInputDTO.class);
        String designGoal = firstPresent(input.getDesignGoal(), agentStyleMemoryStore.loadDesignGoal(portfolioId));

        if (designGoal == null || designGoal.isBlank()) {
            return AgentToolExecutionResult.builder()
                    .toolName(AgentToolName.RECOMMEND_STYLE_PALETTE)
                    .toolType(TOOL_TYPE)
                    .status(AgentToolCallStatus.SKIPPED)
                    .rationale(toolRequest.getRationale())
                    .inputJson(inputJson)
                    .outputJson(Map.of())
                    .errorMessage("designGoal is required before style palette recommendations can be generated.")
                    .build();
        }

        //--- Generate palette and font recommendations without mutating memory
        List<StyleColorPresetDTO> recommendedColorPresets = recommendColorPresets(designGoal);
        StyleChatResponseParser.FontRecommendation fontRecommendation = recommendFonts(designGoal);

        Map<String, Object> outputJson = new LinkedHashMap<>();
        outputJson.put("designGoal", designGoal);
        outputJson.put("recommendedColorPresets", recommendedColorPresets);
        outputJson.put("recommendedHeadingFont", fontRecommendation.headingFont());
        outputJson.put("recommendedBodyFont", fontRecommendation.bodyFont());

        return AgentToolExecutionResult.builder()
                .toolName(AgentToolName.RECOMMEND_STYLE_PALETTE)
                .toolType(TOOL_TYPE)
                .status(AgentToolCallStatus.SUCCEEDED)
                .rationale(toolRequest.getRationale())
                .inputJson(inputJson)
                .outputJson(objectMapper.convertValue(outputJson, new TypeReference<Map<String, Object>>() {}))
                .build();
    }

    @Override
    public boolean feedsSynthesis() {
        return true;
    }

    private List<StyleColorPresetDTO> recommendColorPresets(String designGoal) {
        try {
            Prompt prompt = styleChatPromptBuilder.buildColorRecommendationPrompt(designGoal);
            ChatResponse response = geminiChatModel.call(prompt);
            String rawJson = response.getResult().getOutput().getText();
            List<StyleColorPresetDTO> parsed = styleChatResponseParser.parseRecommendedColorPresets(rawJson);
            List<StyleColorPresetDTO> normalized = normalizeColorPresets(parsed);
            if (!normalized.isEmpty()) {
                return normalized;
            }
            log.warn("[agent-style-recommendation] Color recommendation response parsed but produced no valid palettes");
        } catch (Exception exception) {
            log.warn("[agent-style-recommendation] Failed to generate color palette recommendations: {}", exception.getMessage());
        }
        return List.of(buildGoalDerivedFallbackPreset(designGoal));
    }

    private StyleChatResponseParser.FontRecommendation recommendFonts(String designGoal) {
        try {
            Prompt prompt = styleChatPromptBuilder.buildFontRecommendationPrompt(designGoal);
            ChatResponse response = geminiChatModel.call(prompt);
            String rawJson = response.getResult().getOutput().getText();
            StyleChatResponseParser.FontRecommendation recommendation = styleChatResponseParser.parseFontRecommendation(rawJson);
            if (recommendation != null) {
                return recommendation;
            }
            log.warn("[agent-style-recommendation] Font recommendation response parsed but produced no valid result");
        } catch (Exception exception) {
            log.warn("[agent-style-recommendation] Failed to generate font recommendations: {}", exception.getMessage());
        }
        return new StyleChatResponseParser.FontRecommendation(DEFAULT_HEADING_FONT, DEFAULT_BODY_FONT);
    }

    private List<StyleColorPresetDTO> normalizeColorPresets(List<StyleColorPresetDTO> rawPresets) {
        if (rawPresets == null || rawPresets.isEmpty()) {
            return List.of();
        }

        LinkedHashMap<String, StyleColorPresetDTO> deduped = new LinkedHashMap<>();
        int anonymousCounter = 1;
        for (StyleColorPresetDTO raw : rawPresets) {
            if (raw == null) {
                continue;
            }

            String name = safe(raw.getName()).trim();
            if (name.isBlank()) {
                name = "AI Palette " + anonymousCounter++;
            }
            String dedupeKey = name.toLowerCase(Locale.ROOT);
            if (deduped.containsKey(dedupeKey)) {
                continue;
            }

            Map<String, String> normalizedColors = normalizeColors(raw.getColors());
            if (normalizedColors == null) {
                continue;
            }

            String description = safe(raw.getDescription()).trim();
            if (description.isBlank()) {
                description = "Custom AI-generated palette.";
            }

            deduped.put(
                    dedupeKey,
                    new StyleColorPresetDTO(name, description, normalizedColors));
            if (deduped.size() >= 3) {
                break;
            }
        }

        if (deduped.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(deduped.values());
    }

    private Map<String, String> normalizeColors(Map<String, String> colors) {
        if (colors == null || colors.isEmpty()) {
            return null;
        }

        LinkedHashMap<String, String> normalized = new LinkedHashMap<>();
        for (String key : REQUIRED_COLOR_KEYS) {
            String raw = colors.get(key);
            String validHex = normalizeHex(raw);
            if (validHex == null) {
                return null;
            }
            normalized.put(key, validHex);
        }

        return normalized;
    }

    private String normalizeHex(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (!HEX_COLOR_PATTERN.matcher(trimmed).matches()) {
            return null;
        }
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
                colors);
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

    private String firstPresent(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary.trim();
        }
        return fallback == null ? null : fallback.trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
