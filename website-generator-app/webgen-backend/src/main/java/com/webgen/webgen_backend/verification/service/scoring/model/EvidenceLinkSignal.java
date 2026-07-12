package com.webgen.webgen_backend.verification.service.scoring.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Normalized evidence-link scoring signal prepared by assembly layer and
 * consumed by the scoring kernel.
 */
public record EvidenceLinkSignal(
        UUID evidenceId,
        String linkType,
        BigDecimal linkConfidence,
        BigDecimal evidenceDepth,
        BigDecimal linkTypeWeight,
        OffsetDateTime occurredAt,
        OffsetDateTime capturedAt,
        Integer ageDays,
        BigDecimal recencyDecay,
        BigDecimal decayedStrength,
        String reason,
        String title,
        String sourceUrl,
        String provider
) {
    /** Backward-compatible connector constructor where confidence is scoring strength. */
    public EvidenceLinkSignal(
            UUID evidenceId,
            String linkType,
            BigDecimal linkConfidence,
            BigDecimal linkTypeWeight,
            OffsetDateTime occurredAt,
            OffsetDateTime capturedAt,
            Integer ageDays,
            BigDecimal recencyDecay,
            BigDecimal decayedStrength,
            String reason,
            String title,
            String sourceUrl,
            String provider
    ) {
        this(evidenceId, linkType, linkConfidence, null, linkTypeWeight,
                occurredAt, capturedAt, ageDays, recencyDecay, decayedStrength,
                reason, title, sourceUrl, provider);
    }
}
