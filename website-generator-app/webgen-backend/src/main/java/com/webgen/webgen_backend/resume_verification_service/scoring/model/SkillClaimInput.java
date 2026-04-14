package com.webgen.webgen_backend.resume_verification_service.scoring.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Canonicalized claim input consumed by the deterministic scoring kernel.
 */
public record SkillClaimInput(
        UUID claimId,
        String rawValue,
        UUID canonicalSkillId,
        String canonicalSkillName,
        String source,
        String status,
        String canonicalCategory,
        BigDecimal canonicalWeight
) {
}
