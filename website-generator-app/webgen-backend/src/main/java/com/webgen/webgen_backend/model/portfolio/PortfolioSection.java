package com.webgen.webgen_backend.model.portfolio;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PortfolioSection {
    UUID id;
    UUID portfolioId; // Owning portfolio
    String sectionKey; // Section identifier
    String title;
    JsonNode contentJson; // section data
    String reactSource;
    int orderIndex;
    String source; // ai or user

}
