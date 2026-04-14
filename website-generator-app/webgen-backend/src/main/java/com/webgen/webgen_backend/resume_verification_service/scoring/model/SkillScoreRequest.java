package com.webgen.webgen_backend.resume_verification_service.scoring.model;

import java.math.BigDecimal;
import java.util.List;

/**
 * Input for deterministic skill-only score calculation.
 */
public record SkillScoreRequest(
        List<SkillClaimInput> claims,
        BigDecimal parserConfidence
) {
}
