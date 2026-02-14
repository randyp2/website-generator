package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.model.portfolio.style.CompiledStylePreferences;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
