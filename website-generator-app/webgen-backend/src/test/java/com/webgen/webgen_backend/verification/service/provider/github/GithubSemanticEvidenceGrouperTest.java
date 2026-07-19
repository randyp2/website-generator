package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactFingerprintSimilarity;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GithubSemanticEvidenceGrouperTest {

    private static final OffsetDateTime CAPTURED_AT =
            OffsetDateTime.parse("2026-07-12T00:00:00Z");
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ArtifactSemanticFingerprintGenerator generator =
            new ArtifactSemanticFingerprintGenerator();
    private final GithubSemanticEvidenceGrouper grouper = new GithubSemanticEvidenceGrouper(
            new ArtifactFingerprintSimilarity());

    @Test
    void assignsOneGroupToRenamedCopiesFromDifferentRepositories() {
        String source = variedSource("user", "validate", "save");
        EvidenceCandidate first = candidate("repo:octo/one", "github:repository:1");
        EvidenceCandidate second = candidate("repo:octo/two", "github:repository:2");
        Map<String, ArtifactSemanticFingerprint> fingerprints = Map.of(
                first.externalId(), fingerprint("src/User.java", source),
                second.externalId(), fingerprint("lib/RenamedUser.java", source));

        List<EvidenceCandidate> grouped = grouper.group(List.of(first, second), fingerprints);

        assertThat(grouped).extracting(EvidenceCandidate::evidenceGroupKey)
                .containsOnly(grouped.getFirst().evidenceGroupKey());
        assertThat(grouped.getFirst().evidenceGroupKey()).startsWith(
                "github:semantic:v" + ArtifactSemanticFingerprintGenerator.ALGORITHM_VERSION + ':');
        assertThat(grouped).allSatisfy(candidate -> {
            assertThat(candidate.metadata().path("semanticSimilarityGroup")
                    .path("effect").asText()).isEqualTo("strongest_evidence_only");
            assertThat(candidate.metadata().path("semanticSimilarityGroup")
                    .path("minimumSimilarity").asDouble()).isGreaterThanOrEqualTo(0.90d);
        });
    }

    @Test
    void preservesIndependentGroupsForDifferentProjects() {
        EvidenceCandidate first = candidate("repo:octo/one", "github:repository:1");
        EvidenceCandidate second = candidate("repo:octo/two", "github:repository:2");
        Map<String, ArtifactSemanticFingerprint> fingerprints = Map.of(
                first.externalId(), fingerprint("src/User.java",
                        variedSource("user", "validate", "save")),
                second.externalId(), fingerprint("src/Report.ts",
                        variedSource("report", "format", "render")));

        List<EvidenceCandidate> grouped = grouper.group(List.of(first, second), fingerprints);

        assertThat(grouped).extracting(EvidenceCandidate::evidenceGroupKey)
                .containsExactly("github:repository:1", "github:repository:2");
    }

    @Test
    void doesNotGroupSmallSharedScaffolds() {
        EvidenceCandidate first = candidate("repo:octo/one", "github:repository:1");
        EvidenceCandidate second = candidate("repo:octo/two", "github:repository:2");
        ArtifactSemanticFingerprint small = fingerprint(
                "src/App.java", "public class App { public static void main() {} }");

        List<EvidenceCandidate> grouped = grouper.group(
                List.of(first, second),
                Map.of(first.externalId(), small, second.externalId(), small));

        assertThat(grouped).extracting(EvidenceCandidate::evidenceGroupKey)
                .containsExactly("github:repository:1", "github:repository:2");
    }

    private EvidenceCandidate candidate(String externalId, String groupKey) {
        return new EvidenceCandidate(
                externalId,
                groupKey,
                "repository",
                externalId,
                null,
                null,
                CAPTURED_AT,
                CAPTURED_AT,
                objectMapper.createObjectNode());
    }

    private ArtifactSemanticFingerprint fingerprint(String path, String content) {
        return generator.generate(
                        1,
                        List.of(new ArtifactSemanticFingerprintGenerator.SourceDocument(
                                path, content)))
                .orElseThrow();
    }

    private String variedSource(String noun, String action, String result) {
        StringBuilder source = new StringBuilder();
        for (int index = 0; index < 12; index++) {
            source.append("public Object ").append(action).append(index)
                    .append("(String ").append(noun).append(index).append("){")
                    .append(result).append(index).append('(').append(noun).append(index)
                    .append(");return ").append(noun).append(index).append(";}\n");
        }
        return source.toString();
    }
}
