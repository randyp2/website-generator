package com.webgen.webgen_backend.portfolio.dto.crud;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class UpdateResumeRequestDTO {
    private JsonNode parsedJson; // Parsed resume info in json
    private String extractedText; // Extracted normalized text from resume
}
