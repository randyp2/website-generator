package com.webgen.webgen_backend.verification.service.scoring;

import java.math.BigDecimal;

/**
 * Aggregate freshness/strength characteristics of a claim's evidence links,
 * used to explain score movement to the user.
 */
record EvidenceSignalStats(
        int stale180Count,
        int stale365Count,
        BigDecimal strongestStrength,
        BigDecimal weakestStrength,
        String strongestType,
        String weakestType,
        Integer strongestAgeDays,
        Integer weakestAgeDays
) {
    static EvidenceSignalStats empty() {
        return new EvidenceSignalStats(
                0,
                0,
                SkillScoringPolicy.ZERO,
                SkillScoringPolicy.ZERO,
                null,
                null,
                null,
                null
        );
    }
}
