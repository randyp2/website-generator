package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class CreateClaimEvidenceUploadPresignResponseDTO {
    private UUID uploadId;
    private String storageProvider;
    private String storageBucket;
    private String storageKey;
    private String uploadUrl;
    private OffsetDateTime expiresAt;
    private Map<String, String> requiredHeaders;
}

