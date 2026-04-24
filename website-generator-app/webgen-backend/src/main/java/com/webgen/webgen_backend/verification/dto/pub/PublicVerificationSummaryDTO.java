package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class PublicVerificationSummaryDTO {
    private String scoreType;
    private Integer baselineOverallScore;
    private Integer evidenceDelta;
    private Integer overallScore;

    private Integer totalSkills;
    private Integer matchedSkills;
    private Integer unmatchedSkills;

    private BigDecimal normalizedCoverage;
    private BigDecimal sourceQuality;
    private BigDecimal parserConfidence;

    private String profileScoreNarrative;

    private List<PublicVerificationClaimScoreDTO> claims;
    private List<PublicVerificationClaimScoreDTO> unverifiedClaims;
    private List<PublicVerificationSuggestedActionDTO> suggestedActions;

    private OffsetDateTime generatedAt;
}
