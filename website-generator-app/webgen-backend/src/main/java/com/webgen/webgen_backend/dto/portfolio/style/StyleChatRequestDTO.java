package com.webgen.webgen_backend.dto.portfolio.style;

import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class StyleChatRequestDTO {
    private UUID portfolioId;
    private String userMessage;
    private Map<String, String> colorSelections; // only for Q1
    private Map<String, String> fontSelections;  // e.g. { "heading": "Playfair Display", "body": "Inter" }
}
