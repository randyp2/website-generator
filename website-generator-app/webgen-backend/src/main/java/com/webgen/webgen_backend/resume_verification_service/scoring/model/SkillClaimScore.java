package com.webgen.webgen_backend.resume_verification_service.scoring.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Scored claim result produced by the deterministic scoring kernel.
 */
public record SkillClaimScore(
        UUID claimId,
        String rawValue,
        UUID canonicalSkillId,
        String canonicalSkillName,
        String source,
        String status,
        boolean matched,
        String state,
        String canonicalCategory,
        BigDecimal canonicalWeight,
        int claimScore
) {
}
