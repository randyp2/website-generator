package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GithubLineageFallbackGrouperTest {

    private static final OffsetDateTime CAPTURED_AT =
            OffsetDateTime.parse("2026-07-12T00:00:00Z");
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GithubLineageFallbackGrouper grouper = new GithubLineageFallbackGrouper();

    @Test
    void groupsMixedFingerprintCoverageByResolvedLineage() {
        EvidenceCandidate source = candidate("repo:source/app", "github:repository:10", 10L, null);
        EvidenceCandidate fork = candidate("repo:fork/app", "github:repository:22", 22L, 10L);

        List<EvidenceCandidate> grouped = grouper.group(
                List.of(source, fork),
                Map.of(fork.externalId(), fingerprint()));

        assertThat(grouped).extracting(EvidenceCandidate::evidenceGroupKey)
                .containsOnly("github:repository:10");
        assertThat(grouped).allSatisfy(candidate ->
                assertThat(candidate.metadata().path("lineageFallbackGroup")
                        .path("effect").asText()).isEqualTo("strongest_evidence_only"));
    }

    @Test
    void preservesSeparateIdentitiesWhenTheWholeLineageIsComparable() {
        EvidenceCandidate source = candidate("repo:source/app", "github:repository:10", 10L, null);
        EvidenceCandidate fork = candidate("repo:fork/app", "github:repository:22", 22L, 10L);

        List<EvidenceCandidate> grouped = grouper.group(
                List.of(source, fork),
                Map.of(source.externalId(), fingerprint(), fork.externalId(), fingerprint()));

        assertThat(grouped).extracting(EvidenceCandidate::evidenceGroupKey)
                .containsExactly("github:repository:10", "github:repository:22");
    }

    private EvidenceCandidate candidate(
            String externalId,
            String groupKey,
            long repositoryId,
            Long rootRepositoryId
    ) {
        var metadata = objectMapper.createObjectNode();
        metadata.put("repository_id", repositoryId);
        if (rootRepositoryId != null) {
            metadata.put("root_repository_id", rootRepositoryId);
        }
        return new EvidenceCandidate(
                externalId, groupKey, "repository", externalId, null, null,
                CAPTURED_AT, CAPTURED_AT, metadata);
    }

    private ArtifactSemanticFingerprint fingerprint() {
        return new ArtifactSemanticFingerprint(
                1, "exact-hash", List.of("0011", "0022"),
                8, 2, 300, 240, List.of("src/App.java"));
    }
}
