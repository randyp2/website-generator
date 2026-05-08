package com.webgen.webgen_backend.verification.dto.evidence;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ClaimEvidenceUploadDTO {
    private UUID id;
    private UUID claimId;
    private String storageProvider;
    private String storageBucket;
    private String storageKey;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
    private String status;
    private String analysisError;
    private JsonNode metadata;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

