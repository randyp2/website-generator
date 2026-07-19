package com.webgen.webgen_backend.verification.service.scoring;

import java.math.BigDecimal;

/**
 * Intermediate result of the per-claim evidence nudge calculation, retained so
 * the kernel can trace each step of the equation in debug logs.
 */
record EvidenceNudgeComputation(
        BigDecimal effectiveEvidenceStrength,
        BigDecimal support,
        BigDecimal boostProgress,
        BigDecimal headroomNormalized,
        BigDecimal boostNormalized,
        BigDecimal finalClaimNormalized
) {
    static EvidenceNudgeComputation none() {
        return new EvidenceNudgeComputation(
                SkillScoringPolicy.ZERO,
                SkillScoringPolicy.ZERO,
                SkillScoringPolicy.ZERO,
                SkillScoringPolicy.ZERO,
                SkillScoringPolicy.ZERO,
                SkillScoringPolicy.ZERO
        );
    }
}
