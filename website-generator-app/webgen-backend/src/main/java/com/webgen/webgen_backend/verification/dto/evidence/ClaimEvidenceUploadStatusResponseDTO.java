package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ClaimEvidenceUploadStatusResponseDTO {
    private UUID uploadId;
    private String status;
    private String analysisError;
    private OffsetDateTime updatedAt;
}

