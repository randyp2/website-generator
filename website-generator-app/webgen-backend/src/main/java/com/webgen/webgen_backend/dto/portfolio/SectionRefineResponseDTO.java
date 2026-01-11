package com.webgen.webgen_backend.dto.portfolio;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.util.UUID;

@Data
public class SectionRefineResponse {
    String sectionKey;
    JsonNode updatedContentJson;
    String updatedReactSource;
    UUID versionId;
}
