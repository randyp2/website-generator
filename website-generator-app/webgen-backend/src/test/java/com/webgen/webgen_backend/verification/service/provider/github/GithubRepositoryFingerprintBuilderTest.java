package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class GithubRepositoryFingerprintBuilderTest {

    private final GithubRepositoryFingerprintBuilder builder =
            new GithubRepositoryFingerprintBuilder(
                    new GithubRepositoryFilePolicy(),
                    new ArtifactSemanticFingerprintGenerator());

    @Test
    void limitsFingerprintToEightLargestEligibleFiles() {
        Map<String, String> content = sourceFiles(10);
        List<GithubTreeResponse.Entry> tree = content.keySet().stream()
                .map(path -> entry(path, 50_000L))
                .toList();

        ArtifactSemanticFingerprint fingerprint = builder.build(tree, content::get);

        assertThat(fingerprint.sampledFileCount()).isEqualTo(8);
        assertThat(fingerprint.sampledPaths()).hasSize(8);
    }

    @Test
    void enforcesTotalKnownSizeBudget() {
        Map<String, String> content = sourceFiles(8);
        List<GithubTreeResponse.Entry> tree = content.keySet().stream()
                .map(path -> entry(path, 100_001L))
                .toList();

        ArtifactSemanticFingerprint fingerprint = builder.build(tree, content::get);

        assertThat(fingerprint.sampledFileCount()).isEqualTo(5);
        assertThat(fingerprint.sampledPaths()).hasSize(5);
    }

    private Map<String, String> sourceFiles(int count) {
        Map<String, String> content = new LinkedHashMap<>();
        IntStream.range(0, count).forEach(index -> content.put(
                "src/Service" + index + ".java",
                variedSource(index)));
        return content;
    }

    private String variedSource(int fileIndex) {
        StringBuilder source = new StringBuilder();
        IntStream.range(0, 12).forEach(methodIndex -> source
                .append("public Object method").append(fileIndex).append('_').append(methodIndex)
                .append("(String value").append(methodIndex).append("){")
                .append("validate").append(methodIndex).append("(value").append(methodIndex)
                .append(");return save").append(fileIndex).append("(value")
                .append(methodIndex).append(");}\n"));
        return source.toString();
    }

    private GithubTreeResponse.Entry entry(String path, long size) {
        return new GithubTreeResponse.Entry(path, "blob", "sha-" + path, size);
    }
}
