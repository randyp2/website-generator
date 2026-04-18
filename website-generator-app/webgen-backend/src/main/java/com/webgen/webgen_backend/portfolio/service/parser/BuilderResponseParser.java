package com.webgen.webgen_backend.portfolio.service.parser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BuilderResponseParser {
    private final ObjectMapper objectMapper;

    public SectionDTO parseSingleRefinedSection(String rawJson) {

        try {
            JsonNode root = objectMapper.readTree(rawJson);

            SectionDTO sectionDTO = new SectionDTO();
            sectionDTO.setSectionKey(root.path("sectionKey").asText(""));
            sectionDTO.setTitle(root.path("title").asText(""));
            sectionDTO.setOrderIndex(root.path("orderIndex").isNumber()
                                    ? root.path("orderIndex").asInt()
                                    : null);
            sectionDTO.setReactSource(root.path("reactSource").asText(""));
            sectionDTO.setChangeDescription(root.path("changeDescription").asText(null));

            JsonNode contentNode = root.path("contentJson");
            if (!contentNode.isMissingNode())
                sectionDTO.setContentJson(contentNode);

            return sectionDTO;
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to parse refined section JSON", e);
        }

    }
}
