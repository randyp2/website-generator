package com.webgen.webgen_backend.dto.profile.verification;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ResumeVerificationDTO {
    private UUID id;
    private UUID profileId;
    private String rawFileBucket;
    private String rawFilePath;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
    private String extractedText;
    private JsonNode parsedJson;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
