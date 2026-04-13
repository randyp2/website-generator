package com.webgen.webgen_backend.dto.profile.verification;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ClaimDTO {
    private UUID id;
    private UUID profileId;
    private UUID resumeVerificationId;
    private String claimType;
    private String rawValue;
    private UUID canonicalSkillId;
    private String canonicalSkillName;
    private String source;
    private BigDecimal confidence;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
