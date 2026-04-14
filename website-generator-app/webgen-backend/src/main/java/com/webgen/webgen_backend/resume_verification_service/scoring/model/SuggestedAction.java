package com.webgen.webgen_backend.resume_verification_service.scoring.model;

import java.util.UUID;

/**
 * Deterministic next-step recommendation for a claim.
 */
public record SuggestedAction(
        UUID claimId,
        String action,
        String reason,
        int priority
) {
}
