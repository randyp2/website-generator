package com.webgen.webgen_backend.dto.portfolio;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.util.Map;

@Data
public class SectionDTO {
    String sectionKey; // i.e. "Projects", "Experience"
    String title;
    Integer orderIndex; // ordering of sections in layout
    JsonNode contentJson;
    String reactSource; // React source code for the section
}
