package com.webgen.webgen_backend.dto.portfolio.style;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class StyleSuggestionsRequestDTO {
    private String templateId;
    private JsonNode resume;
}
