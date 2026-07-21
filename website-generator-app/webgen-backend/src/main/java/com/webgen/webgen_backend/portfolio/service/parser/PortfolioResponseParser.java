package com.webgen.webgen_backend.portfolio.service.parser;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.*;
import com.webgen.webgen_backend.portfolio.dto.common.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioResponseParser {

    private static final Pattern MARKDOWN_FENCE = Pattern.compile("^\\s*```(?:json)?\\s*\\n?(.*?)\\n?\\s*```\\s*$", Pattern.DOTALL);

    private final ObjectMapper objectMapper;

    /**
     * Parses the LLM's blueprint JSON into a BlueprintDTO.
     * Validates that globalTheme and sectionPlan are present before returning.
     *
     * @param rawJson raw JSON string from the LLM (may include markdown fences)
     * @return parsed blueprint with globalTheme, sectionPlan, designDirective, and assistantMessage
     * @throws IllegalArgumentException if the JSON is malformed or required fields are missing
     */
    public BlueprintDTO parseBlueprintResponse(String rawJson) {
        rawJson = extractJson(rawJson);

        try {
            JsonNode root = objectMapper.readTree(rawJson);

            BlueprintDTO blueprint = new BlueprintDTO();

            // --- Parse the global theme
            JsonNode themeNode = root.path("globalTheme");
            if (!themeNode.isMissingNode() && !themeNode.isNull()) {
                GlobalThemeDTO theme = new GlobalThemeDTO();
                theme.setBackground(themeNode.path("background").asText(""));
                theme.setTextPrimary(themeNode.path("textPrimary").asText(""));
                theme.setTextSecondary(themeNode.path("textSecondary").asText(""));
                theme.setAccentColor(themeNode.path("accentColor").asText(""));

                // Parse fonts if present
                JsonNode fontsNode = themeNode.path("fonts");
                if (!fontsNode.isMissingNode() && !fontsNode.isNull()) {
                    theme.setFonts(Map.of(
                            "heading", fontsNode.path("heading").asText("Inter"),
                            "body", fontsNode.path("body").asText("Inter")));
                }

                blueprint.setGlobalThemeDTO(theme);
            } else {
                throw new IllegalArgumentException("Blueprint globaltheme is missing");
            }

            // Parse design directive
            blueprint.setDesignDirective(root.path("designDirective").asText());

            // Parse section plan array
            JsonNode planNode = root.path("sectionPlan");
            if (!planNode.isArray())
                throw new IllegalArgumentException("Blueprint sectionPlan is not an array");

            List<BlueprintSectionPlanDTO> plan = new ArrayList<>();
            for (JsonNode node : planNode) {
                BlueprintSectionPlanDTO section = new BlueprintSectionPlanDTO();
                section.setSectionKey(node.path("sectionKey").asText().trim().toLowerCase());
                section.setTitle(node.path("title").asText());
                section.setOrderIndex(node.path("orderIndex").asInt());
                section.setLayoutHint(node.path("layoutHint").asText(""));
                section.setContentStrategy(node.path("contentStrategy").asText());

                plan.add(section);
            }

            blueprint.setSectionPlan(plan);

            // Parse assistant message
            JsonNode assistantNode = root.path("assistantMessage");
            if (!assistantNode.isMissingNode() && !assistantNode.isNull()) {
                AssistantMessageDTO msg = new AssistantMessageDTO();
                msg.setSummary(assistantNode.path("summary").asText());

                // Parse suggestions
                List<String> suggestions = new ArrayList<>();
                for (JsonNode s : assistantNode.path("suggestions")) {
                    suggestions.add(s.asText());
                }

                msg.setSuggestions(suggestions);
                blueprint.setAssistantMessage(msg);
            }

            return blueprint;
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to parse blueprint json", e);
        }
    }

    /**
     * Parses a single section's JSON response from the per-section generation step.
     *
     * @param rawJson raw JSON string from the LLM (may include markdown fences)
     * @return SectionDTO with sectionKey, title, orderIndex, contentJson, and reactSource
     * @throws IllegalArgumentException if the JSON is malformed
     */
    public SectionDTO parseSingleSectionResponse(String rawJson) {
        rawJson = extractJson(rawJson);

        try {

            JsonNode root = objectMapper.readTree(rawJson);

            SectionDTO section = new SectionDTO();
            section.setSectionKey(normalizeSectionKey(root.path("sectionKey").asText()));
            section.setTitle(root.path("title").asText());
            section.setOrderIndex(root.path("orderIndex").asInt());
            section.setContentJson(root.path("contentJson"));
            section.setReactSource(sanitizeReactSource(root.path("reactSource").asText()));

            return section;
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to parse a single section", e);
        }
    }

    /**
     * Parses the full one-shot portfolio generation response into a PortfolioGenerateResponseDTO.
     * Expects globalTheme, sections array, and assistantMessage in the LLM JSON output.
     *
     * @param rawJson raw JSON string from the LLM (may include markdown fences)
     * @return fully populated response DTO
     * @throws IllegalArgumentException if the JSON is malformed or required fields are missing
     */
    public PortfolioGenerateResponseDTO parseGenerateResponse(String rawJson) {
        rawJson = extractJson(rawJson);

        try {
            JsonNode root = objectMapper.readTree(rawJson);

            PortfolioGenerateResponseDTO response = new PortfolioGenerateResponseDTO();

            // --- Parse globalTheme (required)
            JsonNode themeNode = root.path("globalTheme");
            if (!themeNode.isMissingNode() && themeNode.isObject()) {
                GlobalThemeDTO theme = new GlobalThemeDTO();
                theme.setBackground(themeNode.path("background").asText(""));
                theme.setTextPrimary(themeNode.path("textPrimary").asText(""));
                theme.setTextSecondary(themeNode.path("textSecondary").asText(""));
                theme.setAccentColor(themeNode.path("accentColor").asText(""));
                response.setGlobalTheme(theme);
            } else {
                log.warn("Generate response globalTheme missing or invalid");
            }

            // --- Parse assistant message
            JsonNode assistantNode = root.path("assistantMessage");
            if (assistantNode.isMissingNode() || !assistantNode.isObject()) {
                throw new IllegalArgumentException("Assistant message node missing");
            }

            AssistantMessageDTO msg = new AssistantMessageDTO();
            msg.setSummary(assistantNode.path("summary").asText());

            List<String> suggestions = new ArrayList<>();
            JsonNode suggestionsNode = assistantNode.path("suggestions");

            for (JsonNode node : suggestionsNode)
                suggestions.add(node.asText());

            msg.setSuggestions(suggestions);
            response.setAssistantMessage(msg);

            // --- Parse sections
            List<SectionDTO> sections = new ArrayList<>();
            JsonNode sectionsNode = root.path("sections");

            if (!sectionsNode.isArray()) {
                throw new IllegalArgumentException("AI response sections field is not an array");
            }

            for (JsonNode node : sectionsNode) {
                SectionDTO section = new SectionDTO();
                section.setSectionKey(normalizeSectionKey(node.path("sectionKey").asText()));
                section.setTitle(node.path("title").asText());
                section.setOrderIndex(node.path("orderIndex").asInt());
                section.setContentJson(node.path("contentJson"));
                section.setReactSource(sanitizeReactSource(node.path("reactSource").asText()));

                sections.add(section);
            }

            response.setSections(sections);

            return response;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse AI response JSON", e);
        }
    }

    /**
     * Validates the structure of a parsed portfolio generation response.
     * Checks that sections are non-empty, navbar is first, footer is last,
     * all section keys are present, all reactSource strings are non-blank,
     * and the assistantMessage is included.
     *
     * @param response parsed response to validate
     * @throws IllegalArgumentException if any structural requirement is violated
     */
    public void validateGenerateResponse(PortfolioGenerateResponseDTO response) {
        if (response.getSections() == null || response.getSections().isEmpty())
            throw new IllegalArgumentException("AI returned no sections.");

        // -- Check for missing navbar or footer
        if (!response.getSections().getFirst().getSectionKey().equals("navbar")
                || !response.getSections().getLast().getSectionKey().equals("footer"))
            throw new IllegalArgumentException("Navbar and/or footer is missing");

        // -- Check for missing sections
        for (SectionDTO section : response.getSections()) {
            if (section.getSectionKey() == null || section.getSectionKey().isBlank())
                throw new IllegalArgumentException("Section key missing.");

            if (section.getReactSource() == null || section.getReactSource().isBlank())
                throw new IllegalArgumentException("React source missing for section: " + section.getSectionKey());
        }

        // -- Check for assistant message
        if (response.getAssistantMessage() == null)
            throw new IllegalArgumentException("Assistant message is missing");
    }

    /* ============== PARSING HELPERS ============== */

    /** Lowercases and trims the sectionKey to ensure consistent matching across parser and DB. */
    private String normalizeSectionKey(String sectionKey) {
        return sectionKey == null ? null : sectionKey.trim().toLowerCase();
    }

    /*
     * LLMs frequently pad the JSON payload with prose or trailing commentary
     * ("Here is your blueprint: { ... } Hope this helps!"), which the strict
     * full-string fence matcher could not handle. This first strips any markdown
     * fence, then scans for the first balanced JSON value ({...} or [...]) and
     * returns just that substring. String literals are tracked so braces inside
     * strings do not affect depth. Falls back to the fence-stripped input when no
     * balanced value is found, preserving prior behavior for clean responses.
     */
    private String extractJson(String raw) {
        String stripped = stripMarkdownFence(raw);
        if (stripped == null)
            return null;

        int start = -1;
        for (int i = 0; i < stripped.length(); i++) {
            char c = stripped.charAt(i);
            if (c == '{' || c == '[') {
                start = i;
                break;
            }
        }
        if (start < 0)
            return stripped;

        char open = stripped.charAt(start);
        char close = open == '{' ? '}' : ']';

        int depth = 0;
        boolean inString = false;
        boolean escaped = false;

        for (int i = start; i < stripped.length(); i++) {
            char c = stripped.charAt(i);

            if (inString) {
                if (escaped)
                    escaped = false;
                else if (c == '\\')
                    escaped = true;
                else if (c == '"')
                    inString = false;
                continue;
            }

            if (c == '"')
                inString = true;
            else if (c == open)
                depth++;
            else if (c == close) {
                depth--;
                if (depth == 0)
                    return stripped.substring(start, i + 1);
            }
        }

        // Unbalanced (e.g. a truncated response): return from the opener onward
        // and let Jackson surface a precise parse error.
        return stripped.substring(start);
    }

    /*
     * LLMs sometimes wrap JSON in markdown code fences (```json ... ```).
     * This strips the fence so Jackson can parse the content directly.
     */
    private String stripMarkdownFence(String raw) {
        if (raw == null) return null;
        var matcher = MARKDOWN_FENCE.matcher(raw);
        return matcher.matches() ? matcher.group(1).trim() : raw.trim();
    }

    /** Strips ASCII control characters (except newline, carriage return, tab) to prevent JSX parse failures. */
    private String sanitizeReactSource(String reactSource) {
        if (reactSource == null) {
            return null;
        }
        return reactSource.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");
    }
}
