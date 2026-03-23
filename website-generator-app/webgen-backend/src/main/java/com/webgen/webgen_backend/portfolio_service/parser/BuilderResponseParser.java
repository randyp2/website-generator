package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.GlobalThemeDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ModifiedSectionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
//    public BuilderResponseDTO parse(String rawJson) {
//        try {
//            JsonNode root = objectMapper.readTree(rawJson);
//
//            BuilderResponseDTO dto = new BuilderResponseDTO();
//            dto.setBuildSummary(root.path("buildSummary").asText(""));
//            dto.setDeletedSectionKeys(readStringList(root.path("deletedSectionKeys")));
//
//            // Parse optional globalTheme
//            JsonNode themeNode = root.path("globalTheme");
//            if (!themeNode.isMissingNode() && themeNode.isObject()) {
//                dto.setGlobalTheme(parseGlobalTheme(themeNode));
//            }
//
//            List<ModifiedSectionDTO> sections = new ArrayList<>();
//            JsonNode sectionsNode = root.path("modifiedSections");
//            if (sectionsNode.isArray()) {
//                for (JsonNode sectionNode : sectionsNode) {
//                    sections.add(parseSection(sectionNode));
//                }
//            }
//            dto.setModifiedSections(sections);
//
//            return dto;
//        } catch (Exception e) {
//            throw new IllegalArgumentException("Failed to parse Builder response JSON", e);
//        }
//    }

    private GlobalThemeDTO parseGlobalTheme(JsonNode node) {
        GlobalThemeDTO theme = new GlobalThemeDTO();
        theme.setBackground(node.path("background").asText(""));
        theme.setTextPrimary(node.path("textPrimary").asText(""));
        theme.setTextSecondary(node.path("textSecondary").asText(""));
        theme.setAccentColor(node.path("accentColor").asText(""));
        return theme;
    }

    private ModifiedSectionDTO parseSection(JsonNode node) {
        ModifiedSectionDTO section = new ModifiedSectionDTO();
        section.setSectionKey(node.path("sectionKey").asText(""));
        section.setTitle(node.path("title").asText(""));
        section.setOrderIndex(node.path("orderIndex").isNumber()
                ? node.path("orderIndex").asInt()
                : null);
        section.setReactSource(node.path("reactSource").asText(""));
        section.setChangeDescription(node.path("changeDescription").asText(""));

        // Parse contentJson as object
        JsonNode contentNode = node.path("contentJson");
        if (!contentNode.isMissingNode()) {
            try {
                section.setContentJson(objectMapper.treeToValue(contentNode, Object.class));
            } catch (Exception e) {
                section.setContentJson(null);
            }
        }

        return section;
    }

    private List<String> readStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                list.add(item.asText(""));
            }
        }
        return list;
    }
}
