package com.webgen.webgen_backend.dto.portfolio.common;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ResumeDTO {
    private UUID id;
    private UUID portfolioId;
    private String rawFileUrl;
    private String extractedText;
    private JsonNode parsedJson;
    private OffsetDateTime createdAt;
}
