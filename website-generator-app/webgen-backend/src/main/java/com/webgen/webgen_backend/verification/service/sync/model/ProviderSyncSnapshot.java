package com.webgen.webgen_backend.verification.service.sync.model;

import java.util.List;

public record ProviderSyncSnapshot(
        List<EvidenceCandidate> candidates,
        List<String> repositoryNames,
        int dependencyScannedCount,
        String providerUserLogin,
        Long providerUserId) {
}
