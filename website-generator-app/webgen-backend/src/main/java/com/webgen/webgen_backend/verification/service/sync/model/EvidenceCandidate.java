package com.webgen.webgen_backend.verification.service.sync.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.OffsetDateTime;

public record EvidenceCandidate(
        String externalId,
        String evidenceGroupKey,
        String evidenceType,
        String title,
        String description,
        String sourceUrl,
        OffsetDateTime occurredAt,
        OffsetDateTime capturedAt,
        JsonNode metadata) {

    /** Backward-compatible constructor for providers without explicit grouping. */
    public EvidenceCandidate(
            String externalId,
            String evidenceType,
            String title,
            String description,
            String sourceUrl,
            OffsetDateTime occurredAt,
            OffsetDateTime capturedAt,
            JsonNode metadata
    ) {
        this(externalId, null, evidenceType, title, description, sourceUrl,
                occurredAt, capturedAt, metadata);
    }
}
