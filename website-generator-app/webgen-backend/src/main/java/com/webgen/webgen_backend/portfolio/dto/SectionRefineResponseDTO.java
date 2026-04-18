package com.webgen.webgen_backend.portfolio.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.util.UUID;

@Data
public class SectionRefineResponseDTO {
    String sectionKey;
    JsonNode updatedContentJson;
    String updatedReactSource;
    UUID versionId;
}
