package com.webgen.webgen_backend.dto.profile.verification.summary;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class VerificationClaimScoreDTO {
    private UUID id;
    private String rawValue;
    private UUID canonicalSkillId;
    private String canonicalSkillName;
    private String source;
    private String status;
    private String state;
    private Integer claimScore;
    private String canonicalCategory;
    private BigDecimal canonicalWeight;
}
