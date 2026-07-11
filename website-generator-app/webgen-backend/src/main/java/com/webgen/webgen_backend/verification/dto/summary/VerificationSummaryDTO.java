package com.webgen.webgen_backend.verification.dto.summary;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class VerificationSummaryDTO {
    private String scoreType;
    private Integer baselineOverallScore;
    private Integer evidenceDelta;
    private Integer overallScore;

    /** Canonical recognition breadth, separate from evidence quality. */
    private BigDecimal recognitionCoverage;
    /** Share of recognized claims backed by active evidence. */
    private BigDecimal evidenceCoverage;
    /** Average normalized evidence contribution across recognized claims. */
    private BigDecimal evidenceStrength;
    /** Highest profile-wide assurance tier: self_declared, corroborated, or ai_reviewed. */
    private String verificationTier;
    /** Explicit label preventing the combined score from being read as a probability. */
    private String scoreLabel;

    private Integer totalSkills;
    private Integer matchedSkills;
    private Integer unmatchedSkills;

    private BigDecimal normalizedCoverage;
    private BigDecimal sourceQuality;
    private BigDecimal parserConfidence;

    private String profileScoreNarrative;

    private List<VerificationClaimScoreDTO> claims;
    private List<VerificationClaimScoreDTO> unverifiedClaims;
    private List<VerificationSuggestedActionDTO> suggestedActions;

    private OffsetDateTime generatedAt;
}
