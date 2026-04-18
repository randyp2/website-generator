package com.webgen.webgen_backend.verification.service.scoring.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Input for deterministic skill score calculation.
 */
public record SkillScoreRequest(
        List<SkillClaimInput> claims,
        BigDecimal parserConfidence,
        OffsetDateTime asOf
) {
    /**
     * Backward-compatible constructor used by existing baseline scoring flow.
     */
    public SkillScoreRequest(
            List<SkillClaimInput> claims,
            BigDecimal parserConfidence
    ) {
        this(claims, parserConfidence, null);
    }
}
