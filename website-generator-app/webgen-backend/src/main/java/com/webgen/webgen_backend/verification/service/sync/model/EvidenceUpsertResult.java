package com.webgen.webgen_backend.verification.service.sync.model;

import com.webgen.webgen_backend.verification.entity.Evidence;

import java.util.List;

public record EvidenceUpsertResult(
        int inserted,
        int updated,
        int unchanged,
        List<Evidence> persistedEvidence) {
}
