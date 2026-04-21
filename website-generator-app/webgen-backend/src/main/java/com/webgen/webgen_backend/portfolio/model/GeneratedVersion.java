package com.webgen.webgen_backend.portfolio.model;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class GeneratedVersion {
    UUID id;
    UUID portfolioId;
    String reactSource;
    JsonNode sectionsSnapshot;
    String promptUsed;
    String modelUsed;
    String previewUrl;
    Instant createdAt;
}
