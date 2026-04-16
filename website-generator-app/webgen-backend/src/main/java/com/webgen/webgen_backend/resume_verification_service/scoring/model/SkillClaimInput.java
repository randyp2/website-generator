package com.webgen.webgen_backend.resume_verification_service.scoring.model;

import java.math.BigDecimal;
import java.util.List;
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
        BigDecimal canonicalWeight,
        List<EvidenceLinkSignal> evidenceLinks
) {
    /**
     * Backward-compatible constructor used by existing baseline scoring flow.
     */
    public SkillClaimInput(
            UUID claimId,
            String rawValue,
            UUID canonicalSkillId,
            String canonicalSkillName,
            String source,
            String status,
            String canonicalCategory,
            BigDecimal canonicalWeight
    ) {
        this(
                claimId,
                rawValue,
                canonicalSkillId,
                canonicalSkillName,
                source,
                status,
                canonicalCategory,
                canonicalWeight,
                List.of()
        );
    }
}
