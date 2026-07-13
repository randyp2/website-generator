package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactFingerprintSimilarity;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.shared.EvidenceGroupKeyFactory;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class GithubDerivativeCreditAssignerTest {

    private static final OffsetDateTime CAPTURED_AT =
            OffsetDateTime.parse("2026-07-12T00:00:00Z");
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GithubDerivativeCreditAssigner assigner = new GithubDerivativeCreditAssigner(
            new ArtifactFingerprintSimilarity(),
            new GithubRepositoryNoveltyPolicy());

    @Test
    void givesMeaningfulDerivativePartialCreditAndPreservesSeparateGroup() {
        EvidenceCandidate primary = candidate("repo:octo/primary", "github:repository:1");
        EvidenceCandidate derivative = candidate("repo:octo/derivative", "github:repository:2");
        ArtifactSemanticFingerprint primaryFingerprint = fingerprint(100, 1_000, "primary");
        ArtifactSemanticFingerprint derivativeFingerprint = fingerprint(80, 500, "derivative");

        List<EvidenceCandidate> assigned = assigner.assign(
                List.of(derivative, primary),
                Map.of(
                        primary.externalId(), primaryFingerprint,
                        derivative.externalId(), derivativeFingerprint));
        Map<String, EvidenceCandidate> byId = assigned.stream()
                .collect(Collectors.toMap(EvidenceCandidate::externalId, Function.identity()));

        assertThat(byId.get(primary.externalId()).metadata()
                .path("repositoryIndependence").path("weight").decimalValue())
                .isEqualByComparingTo("1.0");
        assertThat(byId.get(derivative.externalId()).metadata()
                .path("repositoryIndependence").path("sharedContentEstimate").asDouble())
                .isEqualTo(0.80d);
        assertThat(byId.get(derivative.externalId()).metadata()
                .path("repositoryIndependence").path("novelContentEstimate").asDouble())
                .isEqualTo(0.20d);
        assertThat(byId.get(derivative.externalId()).metadata()
                .path("repositoryIndependence").path("weight").decimalValue())
                .isEqualByComparingTo("0.5000");
        assertThat(byId.get(derivative.externalId()).evidenceGroupKey())
                .isEqualTo("github:repository:2");
    }

    @Test
    void leavesMostlyIndependentRepositoriesAtFullCredit() {
        EvidenceCandidate first = candidate("repo:octo/one", "github:repository:1");
        EvidenceCandidate second = candidate("repo:octo/two", "github:repository:2");

        List<EvidenceCandidate> assigned = assigner.assign(
                List.of(first, second),
                Map.of(
                        first.externalId(), fingerprint(100, 1_000, "first"),
                        second.externalId(), fingerprint(50, 500, "second")));

        assertThat(assigned).allSatisfy(candidate ->
                assertThat(candidate.metadata().has("repositoryIndependence")).isFalse());
    }

    @Test
    void givesDivergedForkGradualCreditInsteadOfCollapsingItsLineage() {
        GithubEvidenceCandidateMapper mapper = new GithubEvidenceCandidateMapper(
                objectMapper, new EvidenceGroupKeyFactory());
        ArtifactSemanticFingerprint primaryFingerprint = fingerprint(100, 1_000, "primary");
        ArtifactSemanticFingerprint forkFingerprint = fingerprint(44, 800, "fork");
        EvidenceCandidate primary = mapper.fromRepository(
                repository(1L, "ton-org/ton", null), Map.of(),
                GithubAuthorshipSignal.assessed(5, false), primaryFingerprint, CAPTURED_AT);
        EvidenceCandidate fork = mapper.fromRepository(
                repository(2L, "ton-org/maintained-fork", 1L), Map.of(),
                GithubAuthorshipSignal.assessed(5, true), forkFingerprint, CAPTURED_AT);
        Map<String, ArtifactSemanticFingerprint> fingerprints = Map.of(
                primary.externalId(), primaryFingerprint,
                fork.externalId(), forkFingerprint);
        GithubSemanticEvidenceGrouper grouper = new GithubSemanticEvidenceGrouper(
                new ArtifactFingerprintSimilarity());

        List<EvidenceCandidate> assigned = assigner.assign(
                grouper.group(List.of(primary, fork), fingerprints),
                fingerprints);
        Map<String, EvidenceCandidate> byId = assigned.stream()
                .collect(Collectors.toMap(EvidenceCandidate::externalId, Function.identity()));

        assertThat(byId.get(fork.externalId()).evidenceGroupKey())
                .isEqualTo("github:repository:2");
        assertThat(byId.get(fork.externalId()).metadata()
                .path("repositoryIndependence").path("classification").asText())
                .isEqualTo("lineage_derivative");
        assertThat(byId.get(fork.externalId()).metadata()
                .path("repositoryIndependence").path("sharedContentEstimate").asDouble())
                .isEqualTo(0.44d);
        assertThat(byId.get(fork.externalId()).metadata()
                .path("repositoryIndependence").path("weight").decimalValue())
                .isEqualByComparingTo("0.8500");
    }

    @Test
    void selectsRepositoryWithMoreMeaningfulTokensAsPrimary() {
        EvidenceCandidate larger = candidate("repo:octo/larger", "github:repository:1");
        EvidenceCandidate smaller = candidate("repo:octo/smaller", "github:repository:2");

        List<EvidenceCandidate> assigned = assigner.assign(
                List.of(smaller, larger),
                Map.of(
                        larger.externalId(), fingerprint(100, 2_000, "larger"),
                        smaller.externalId(), fingerprint(75, 300, "smaller")));
        Map<String, EvidenceCandidate> byId = assigned.stream()
                .collect(Collectors.toMap(EvidenceCandidate::externalId, Function.identity()));

        assertThat(byId.get(larger.externalId()).metadata()
                .path("repositoryIndependence").path("classification").asText())
                .isEqualTo("primary");
        assertThat(byId.get(smaller.externalId()).metadata()
                .path("repositoryIndependence").path("classification").asText())
                .isEqualTo("derivative");
    }

    @Test
    void doesNotCreateDerivativeFamiliesThroughSimilarityChains() {
        EvidenceCandidate first = candidate("repo:octo/first", "github:repository:1");
        EvidenceCandidate middle = candidate("repo:octo/middle", "github:repository:2");
        EvidenceCandidate last = candidate("repo:octo/last", "github:repository:3");
        ArtifactSemanticFingerprint firstFingerprint = fingerprintWithSketch(
                range(0, 100), 2_000, "first");
        ArtifactSemanticFingerprint middleFingerprint = fingerprintWithSketch(
                combine(range(0, 70), range(100, 130)), 1_000, "middle");
        ArtifactSemanticFingerprint lastFingerprint = fingerprintWithSketch(
                combine(range(0, 40), range(100, 130), range(200, 230)), 500, "last");

        List<EvidenceCandidate> assigned = assigner.assign(
                List.of(first, middle, last),
                Map.of(
                        first.externalId(), firstFingerprint,
                        middle.externalId(), middleFingerprint,
                        last.externalId(), lastFingerprint));
        Map<String, EvidenceCandidate> byId = assigned.stream()
                .collect(Collectors.toMap(EvidenceCandidate::externalId, Function.identity()));

        assertThat(byId.get(middle.externalId()).metadata()
                .path("repositoryIndependence").path("classification").asText())
                .isEqualTo("derivative");
        assertThat(byId.get(last.externalId()).metadata().has("repositoryIndependence"))
                .isFalse();
    }

    private EvidenceCandidate candidate(String externalId, String groupKey) {
        return new EvidenceCandidate(
                externalId, groupKey, "repository", externalId, null, null,
                CAPTURED_AT, CAPTURED_AT, objectMapper.createObjectNode());
    }

    private GithubRepoResponse repository(Long id, String fullName, Long rootId) {
        GithubRepoResponse.RepositoryIdentity root = rootId == null
                ? null
                : new GithubRepoResponse.RepositoryIdentity(rootId, "ton-org/ton");
        return new GithubRepoResponse(
                id, fullName.substring(fullName.indexOf('/') + 1), fullName, null,
                "https://github.com/" + fullName, "2026-07-12T00:00:00Z",
                "TypeScript", List.of(), "main", root != null, null, root);
    }

    private ArtifactSemanticFingerprint fingerprint(
            int sharedHashes,
            int tokenCount,
            String exactHash
    ) {
        List<String> sketch = new ArrayList<>();
        IntStream.range(0, sharedHashes)
                .mapToObj(index -> String.format("%04d", index))
                .forEach(sketch::add);
        IntStream.range(sharedHashes, 100)
                .mapToObj(index -> String.format("%04d", index + 1_000))
                .forEach(sketch::add);
        return new ArtifactSemanticFingerprint(
                1, exactHash, sketch, 5, 5, tokenCount, 100, List.of("src/App.java"));
    }

    private ArtifactSemanticFingerprint fingerprintWithSketch(
            List<String> sketch,
            int tokenCount,
            String exactHash
    ) {
        return new ArtifactSemanticFingerprint(
                1, exactHash, sketch, 5, 5, tokenCount, 100, List.of("src/App.java"));
    }

    private List<String> range(int startInclusive, int endExclusive) {
        return IntStream.range(startInclusive, endExclusive)
                .mapToObj(index -> String.format("%04d", index))
                .toList();
    }

    @SafeVarargs
    private final List<String> combine(List<String>... ranges) {
        return java.util.Arrays.stream(ranges).flatMap(List::stream).toList();
    }
}
