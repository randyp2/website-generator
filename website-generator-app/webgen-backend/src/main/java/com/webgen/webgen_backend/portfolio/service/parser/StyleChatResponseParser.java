package com.webgen.webgen_backend.portfolio.service.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.style.StyleColorPresetDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.model.style.CompiledStylePreferences;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StyleChatResponseParser {
    private final ObjectMapper objectMapper;

    public record StyleChatParseResult(
            StyleChatResponseDTO response,
            boolean answerValid,
            CompiledStylePreferences compiledPreferences
    ) {}

    public StyleChatParseResult parse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);

            StyleChatResponseDTO dto = new StyleChatResponseDTO();
            dto.setAssistantMessage(root.path("assistantMessage").asText(""));
            dto.setShowTypographyPicker(root.path("showTypographyPicker").asBoolean(false));
            String recHeading = root.path("recommendedHeadingFont").asText(null);
            dto.setRecommendedHeadingFont(recHeading);
            String recBody = root.path("recommendedBodyFont").asText(null);
            dto.setRecommendedBodyFont(recBody);

            // Parse suggestions array
            JsonNode suggestionsNode = root.path("suggestions");
            if (suggestionsNode.isArray()) {
                List<String> suggestions = new ArrayList<>();
                for (JsonNode item : suggestionsNode) {
                    String text = item.asText("");
                    if (!text.isEmpty()) suggestions.add(text);
                }
                dto.setSuggestions(suggestions.isEmpty() ? null : suggestions);
            }

            // Parse designTip
            String designTip = root.path("designTip").asText(null);
            dto.setDesignTip(designTip);

            // Parse previewType
            String previewType = root.path("previewType").asText(null);
            dto.setPreviewType(previewType);

            // Parse recommended custom color presets (optional, primarily used in Q1 color picker step)
            dto.setRecommendedColorPresets(parseColorPresets(root.path("recommendedColorPresets")));

            boolean answerValid = root.path("isAnswerValid").asBoolean(true);

            // Parse compiledStylePreferences if present
            JsonNode prefsNode = root.path("compiledStylePreferences");
            CompiledStylePreferences compiledPreferences = null;
            if (!prefsNode.isNull() && prefsNode.isObject()) {
                compiledPreferences = parseCompiledPreferences(prefsNode);
            }

            return new StyleChatParseResult(dto, answerValid, compiledPreferences);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse AI Style Chat response JSON", e);
        }
    }

    public record FontRecommendation(String headingFont, String bodyFont) {}

    public FontRecommendation parseFontRecommendation(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            String heading = root.path("recommendedHeadingFont").asText(null);
            String body = root.path("recommendedBodyFont").asText(null);
            if (heading != null && !heading.isBlank() && body != null && !body.isBlank()) {
                return new FontRecommendation(heading.trim(), body.trim());
            }
        } catch (Exception ignored) {}
        return null;
    }

    public List<StyleColorPresetDTO> parseRecommendedColorPresets(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            return parseColorPresets(root.path("recommendedColorPresets"));
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<StyleColorPresetDTO> parseColorPresets(JsonNode node) {
        if (!node.isArray()) return null;

        List<StyleColorPresetDTO> presets = new ArrayList<>();
        for (JsonNode item : node) {
            if (!item.isObject()) continue;

            String name = item.path("name").asText("").trim();
            String description = item.path("description").asText("").trim();
            JsonNode colorsNode = item.path("colors");
            if (!colorsNode.isObject()) continue;

            LinkedHashMap<String, String> colors = new LinkedHashMap<>();
            for (String key : List.of("primary", "secondary", "accent", "background", "text", "muted")) {
                String color = colorsNode.path(key).asText("").trim();
                if (!color.isEmpty()) colors.put(key, color);
            }

            if (colors.size() < 6) continue;
            presets.add(new StyleColorPresetDTO(name, description, colors));
            if (presets.size() >= 3) break;
        }

        return presets.isEmpty() ? null : presets;
    }

    private CompiledStylePreferences parseCompiledPreferences(JsonNode node) {
        CompiledStylePreferences prefs = new CompiledStylePreferences();
        prefs.setColorScheme(node.path("colorScheme").asText(""));
        prefs.setLayoutDensity(node.path("layoutDensity").asText(""));
        prefs.setTone(node.path("tone").asText(""));
        prefs.setVisualStyle(node.path("visualStyle").asText(""));
        prefs.setSectionEmphasis(node.path("sectionEmphasis").asText(""));
        prefs.setTypography(node.path("typography").asText(""));
        prefs.setAnimationStyle(node.path("animationStyle").asText(""));
        prefs.setWhitespace(node.path("whitespace").asText(""));
        prefs.setImageryStyle(node.path("imageryStyle").asText(""));
        prefs.setInteractiveElements(node.path("interactiveElements").asText(""));
        prefs.setCustomNotes(node.path("customNotes").asText(""));
        return prefs;
    }
}
