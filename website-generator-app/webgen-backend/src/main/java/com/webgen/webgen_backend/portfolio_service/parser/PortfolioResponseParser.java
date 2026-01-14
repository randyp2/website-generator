package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.AssistantMessageDTO;
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
        try {
            JsonNode root = objectMapper.readTree(rawJson);

            PortfolioGenerateResponseDTO response = new PortfolioGenerateResponseDTO();

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
                System.out.println("NOT AN ARRAY! ");
                return new PortfolioGenerateResponseDTO();
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
