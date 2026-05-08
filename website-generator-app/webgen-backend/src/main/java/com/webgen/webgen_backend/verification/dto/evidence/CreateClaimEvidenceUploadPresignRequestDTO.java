package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Data;

@Data
public class CreateClaimEvidenceUploadPresignRequestDTO {
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
}

