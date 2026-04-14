package com.webgen.webgen_backend.dto.profile.verification.summary;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class VerificationSummaryDTO {
    private String scoreType;
    private Integer overallScore;

    private Integer totalSkills;
    private Integer matchedSkills;
    private Integer unmatchedSkills;

    private BigDecimal normalizedCoverage;
    private BigDecimal sourceQuality;
    private BigDecimal parserConfidence;

    private List<VerificationClaimScoreDTO> claims;
    private List<VerificationClaimScoreDTO> unverifiedClaims;
    private List<VerificationSuggestedActionDTO> suggestedActions;

    private OffsetDateTime generatedAt;
}
