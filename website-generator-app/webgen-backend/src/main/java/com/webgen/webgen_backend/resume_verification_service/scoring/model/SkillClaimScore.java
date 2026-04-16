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
        int baselineClaimScore,
        int evidenceContribution,
        int evidenceLinksUsed,
        int claimScore,
        String scoreReasonCode,
        String scoreReasonText
) {
    /**
     * Backward-compatible constructor used by existing baseline scoring flow.
     */
    public SkillClaimScore(
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
        this(
                claimId,
                rawValue,
                canonicalSkillId,
                canonicalSkillName,
                source,
                status,
                matched,
                state,
                canonicalCategory,
                canonicalWeight,
                claimScore,
                0,
                0,
                claimScore,
                matched ? "match_no_evidence" : "no_match_no_evidence",
                matched
                        ? "This skill is recognized from your resume, but no external evidence is linked yet."
                        : "This skill is not yet recognized and has no external evidence linked yet."
        );
    }
}
