package com.webgen.webgen_backend.verification.service.sync.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;

public record ClaimEvidenceMatchResult(
        boolean matched,
        String linkType,
        BigDecimal confidence,
        String reason,
        JsonNode metadata) {

    public static ClaimEvidenceMatchResult noMatch() {
        return new ClaimEvidenceMatchResult(
                false,
                null,
                BigDecimal.ZERO,
                null,
                null);
    }
}
