package com.webgen.webgen_backend.portfolio.service.parser;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.*;
import com.webgen.webgen_backend.portfolio.dto.common.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PortfolioResponseParser {

    private static final Pattern MARKDOWN_FENCE = Pattern.compile("^\\s*```(?:json)?\\s*\\n?(.*?)\\n?\\s*```\\s*$", Pattern.DOTALL);

    private final ObjectMapper objectMapper;

    public BlueprintDTO parseBlueprintResponse(String rawJson) {
        System.out.println(">>> [PARSER] parseBlueprintResponse () started");
        System.out.println(">>> [PARSER] Raw JSON length: " + (rawJson != null ? rawJson.length() : 0));
        rawJson = stripMarkdownFence(rawJson);

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

            System.out.println(
                    ">>> [PARSER] Blueprint parsed: "
                            + plan.size()
                            + " sections planned.");
            return blueprint;
        } catch (JsonProcessingException e) {
            System.out.println(">>> [PARSER] ERROR: Failed to parse blueprint: " + e.getMessage());
            throw new IllegalArgumentException("Failed to parse blueprint json", e);
        }
    }

    public SectionDTO parseSingleSectionResponse(String rawJson) {
        System.out.println(">>> [PARSER] parseSectionResponse() started");
        rawJson = stripMarkdownFence(rawJson);

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
            System.out.println(">>> [PARSER] ERROR: Failed to parse blueprint: " + e.getMessage());
            throw new IllegalArgumentException("Failed to parse a single section", e);
        }
    }

    public PortfolioGenerateResponseDTO parseGenerateResponse(String rawJson) {
        System.out.println(">>> [PARSER] parseGenerateResponse() started");
        System.out.println(">>> [PARSER] Raw JSON length: " + (rawJson != null ? rawJson.length() : 0));
        rawJson = stripMarkdownFence(rawJson);

        try {
            JsonNode root = objectMapper.readTree(rawJson);
            System.out.println(">>> [PARSER] JSON parsed successfully");

            PortfolioGenerateResponseDTO response = new PortfolioGenerateResponseDTO();

            // --- Parse globalTheme (required)
            System.out.println(">>> [PARSER] Parsing globalTheme...");
            JsonNode themeNode = root.path("globalTheme");
            if (!themeNode.isMissingNode() && themeNode.isObject()) {
                GlobalThemeDTO theme = new GlobalThemeDTO();
                theme.setBackground(themeNode.path("background").asText(""));
                theme.setTextPrimary(themeNode.path("textPrimary").asText(""));
                theme.setTextSecondary(themeNode.path("textSecondary").asText(""));
                theme.setAccentColor(themeNode.path("accentColor").asText(""));
                response.setGlobalTheme(theme);
                System.out.println(">>> [PARSER] GlobalTheme parsed: " + theme.getBackground());
            } else {
                System.out.println(">>> [PARSER] WARNING: globalTheme missing or invalid");
            }

            // --- Parse assistant message
            System.out.println(">>> [PARSER] Parsing assistantMessage...");
            JsonNode assistantNode = root.path("assistantMessage");
            if (assistantNode.isMissingNode() || !assistantNode.isObject()) {
                System.out.println(">>> [PARSER] ERROR: Assistant message node missing");
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
            System.out.println(">>> [PARSER] Parsing sections...");
            List<SectionDTO> sections = new ArrayList<>();
            JsonNode sectionsNode = root.path("sections");

            if (!sectionsNode.isArray()) {
                System.out.println(">>> [PARSER] ERROR: sections is NOT an array!");
                throw new IllegalArgumentException("AI response sections field is not an array");
            }

            System.out.println(">>> [PARSER] Found " + sectionsNode.size() + " sections");

            for (JsonNode node : sectionsNode) {
                SectionDTO section = new SectionDTO();
                section.setSectionKey(normalizeSectionKey(node.path("sectionKey").asText()));
                section.setTitle(node.path("title").asText());
                section.setOrderIndex(node.path("orderIndex").asInt());
                section.setContentJson(node.path("contentJson"));
                section.setReactSource(sanitizeReactSource(node.path("reactSource").asText()));

                System.out.println(">>> [PARSER] Parsed section: " + section.getSectionKey() + " (index: "
                        + section.getOrderIndex() + ")");
                sections.add(section);
            }

            response.setSections(sections);
            System.out.println(">>> [PARSER] All sections parsed successfully");

            return response;
        } catch (Exception e) {
            System.out.println(">>> [PARSER] ERROR: Failed to parse AI response JSON: " + e.getMessage());
            throw new IllegalArgumentException("Failed to parse AI response JSON", e);
        }
    }

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

    private String normalizeSectionKey(String sectionKey) {
        return sectionKey == null ? null : sectionKey.trim().toLowerCase();
    }

    private String stripMarkdownFence(String raw) {
        if (raw == null) return null;
        var matcher = MARKDOWN_FENCE.matcher(raw);
        return matcher.matches() ? matcher.group(1).trim() : raw.trim();
    }

    private String sanitizeReactSource(String reactSource) {
        if (reactSource == null) {
            return null;
        }
        // Remove ASCII control characters that can break parsing/rendering.
        return reactSource.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");
    }
}
