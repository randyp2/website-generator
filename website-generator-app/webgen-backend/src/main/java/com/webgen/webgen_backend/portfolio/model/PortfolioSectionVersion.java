package com.webgen.webgen_backend.portfolio.model;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PortfolioSectionVersion {

    UUID id;
    UUID portfolioId; // Owning portfolio
    JsonNode contentJson;
    String reactSource;
    String promptUsed;
    String modelUsed;
    UUID createdBy;
    Instant createdAt;
}
