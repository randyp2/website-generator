package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PublicVerificationClaimScoreDTO {
    private UUID id;
    private String rawValue;
    private UUID canonicalSkillId;
    private String canonicalSkillName;
    private String source;
    private String status;
    private String state;
    private Integer baselineClaimScore;
    private Integer evidenceContribution;
    private Integer evidenceLinksUsed;
    private Integer claimScore;
    private String scoreReasonCode;
    private String scoreReasonText;
    private String canonicalCategory;
    private BigDecimal canonicalWeight;
}
