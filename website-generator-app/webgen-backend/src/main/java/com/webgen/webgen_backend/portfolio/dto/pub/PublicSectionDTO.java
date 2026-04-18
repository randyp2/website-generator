package com.webgen.webgen_backend.portfolio.dto.pub;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class PublicSectionDTO {
    private String sectionKey;
    private String title;
    private Integer orderIndex;
    private JsonNode contentJson;
    private String reactSource;
}
