package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.AssistantMessageDTO;
import com.webgen.webgen_backend.dto.portfolio.GlobalThemeDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioResponseParser {

    private final ObjectMapper objectMapper;

    /**
     * Parses a json response that populates SectionDTOs and source code for each section
     * @param rawJson - rawJson response from ai agent
     * @return - response dto
     */
    public PortfolioGenerateResponseDTO parseGenerateResponse(String rawJson) {
        System.out.println(">>> [PARSER] parseGenerateResponse() started");
        System.out.println(">>> [PARSER] Raw JSON length: " + (rawJson != null ? rawJson.length() : 0));

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
                return new PortfolioGenerateResponseDTO();
            }

            System.out.println(">>> [PARSER] Found " + sectionsNode.size() + " sections");

            for (JsonNode node : sectionsNode) {
                SectionDTO section = new SectionDTO();
                section.setSectionKey(normalizeSectionKey(node.path("sectionKey").asText()));
                section.setTitle(node.path("title").asText());
                section.setOrderIndex(node.path("orderIndex").asInt());
                section.setContentJson(node.path("contentJson"));
                section.setReactSource(sanitizeReactSource(node.path("reactSource").asText()));

                System.out.println(">>> [PARSER] Parsed section: " + section.getSectionKey() + " (index: " + section.getOrderIndex() + ")");
                sections.add(section);
            }

            response.setSections(sections);
            System.out.println(">>> [PARSER] All sections parsed successfully");

            return response;
        } catch (Exception e) {
            System.out.println(">>> [PARSER] ERROR: Failed to parse AI response JSON: " + e.getMessage());
            e.printStackTrace();
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

    private String sanitizeReactSource(String reactSource) {
        if (reactSource == null) {
            return null;
        }
        // Remove ASCII control characters that can break parsing/rendering.
        return reactSource.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");
    }
}
