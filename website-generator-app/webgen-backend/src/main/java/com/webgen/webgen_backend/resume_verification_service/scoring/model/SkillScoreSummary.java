package com.webgen.webgen_backend.resume_verification_service.scoring.model;

import java.math.BigDecimal;
import java.util.List;

/**
 * Output from deterministic skill-only scoring.
 */
public record SkillScoreSummary(
        String scoreType,
        int baselineOverallScore,
        int evidenceDelta,
        int overallScore,
        int totalSkills,
        int matchedSkills,
        int unmatchedSkills,
        BigDecimal normalizedCoverage,
        BigDecimal sourceQuality,
        BigDecimal parserConfidence,
        List<SkillClaimScore> claims,
        List<SkillClaimScore> unverifiedClaims,
        List<SuggestedAction> suggestedActions
) {
    /**
     * Backward-compatible constructor used by existing baseline scoring flow.
     */
    public SkillScoreSummary(
            String scoreType,
            int overallScore,
            int totalSkills,
            int matchedSkills,
            int unmatchedSkills,
            BigDecimal normalizedCoverage,
            BigDecimal sourceQuality,
            BigDecimal parserConfidence,
            List<SkillClaimScore> claims,
            List<SkillClaimScore> unverifiedClaims,
            List<SuggestedAction> suggestedActions
    ) {
        this(
                scoreType,
                overallScore,
                0,
                overallScore,
                totalSkills,
                matchedSkills,
                unmatchedSkills,
                normalizedCoverage,
                sourceQuality,
                parserConfidence,
                claims,
                unverifiedClaims,
                suggestedActions
        );
    }
}
