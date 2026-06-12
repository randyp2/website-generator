package com.webgen.webgen_backend.portfolio.dto.style;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StyleChatRequestDTO {
    private UUID portfolioId;
    private String userMessage;
    private Map<String, String> colorSelections; // only for Q1
    private Map<String, String> fontSelections;  // e.g. { "heading": "Playfair Display", "body": "Inter" }
    private String layoutSelection;              // e.g. "Bento", "Spacious", etc.
}
