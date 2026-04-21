package com.webgen.webgen_backend.verification.service.scoring.model;

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
