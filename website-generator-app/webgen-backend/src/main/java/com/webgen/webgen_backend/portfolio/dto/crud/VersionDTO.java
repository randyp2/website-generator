package com.webgen.webgen_backend.portfolio.dto.crud;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class VersionDTO {
    private UUID id;
    private OffsetDateTime createdAt;
    private JsonNode assistantMessage;
    private String promptUsed;
    private String previewUrl;
    private boolean isActive;
}
