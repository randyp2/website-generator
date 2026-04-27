package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class PublicClaimDTO {
    private UUID id;
    private String claimType;
    private String rawValue;
    private UUID canonicalSkillId;
    private String canonicalSkillName;
    private String source;
    private BigDecimal confidence;
    private String status;
    private PublicClaimEvidenceSummaryDTO evidenceSummary;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
