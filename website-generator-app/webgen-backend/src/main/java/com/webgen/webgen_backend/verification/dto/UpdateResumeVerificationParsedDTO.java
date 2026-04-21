package com.webgen.webgen_backend.verification.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class UpdateResumeVerificationParsedDTO {
    private String extractedText;
    private JsonNode parsedJson;
}
