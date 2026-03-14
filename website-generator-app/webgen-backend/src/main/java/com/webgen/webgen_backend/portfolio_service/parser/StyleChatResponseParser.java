package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.model.portfolio.style.CompiledStylePreferences;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
