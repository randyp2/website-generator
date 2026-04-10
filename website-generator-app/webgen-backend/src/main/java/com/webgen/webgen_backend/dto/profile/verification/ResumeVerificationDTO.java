package com.webgen.webgen_backend.dto.profile.verification;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ResumeVerificationDTO {
    private UUID id;
    private UUID profileId;
    private String rawFileUrl;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
