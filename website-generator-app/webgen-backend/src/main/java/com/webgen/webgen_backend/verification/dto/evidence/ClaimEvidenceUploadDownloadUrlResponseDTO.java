package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ClaimEvidenceUploadDownloadUrlResponseDTO {
    private UUID uploadId;
    private String originalFileName;
    private String contentType;
    private String downloadUrl;
    private OffsetDateTime expiresAt;
}
