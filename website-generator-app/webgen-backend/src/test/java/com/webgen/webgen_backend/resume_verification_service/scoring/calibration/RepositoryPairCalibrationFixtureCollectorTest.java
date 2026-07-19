package com.webgen.webgen_backend.resume_verification_service.scoring.calibration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import com.webgen.webgen_backend.verification.service.provider.github.GithubRepositoryFilePolicy;
import com.webgen.webgen_backend.verification.service.provider.github.GithubRepositoryFingerprintBuilder;
import com.webgen.webgen_backend.verification.service.provider.github.GithubRepositorySampleSelector;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Opt-in fixture collector. Normal CI reads the generated offline fixture only. */
@EnabledIfSystemProperty(named = "repositoryCalibrationRoot", matches = ".+")
class RepositoryPairCalibrationFixtureCollectorTest {

    private static final String SOURCE_MANIFEST =
            "/verification/repository-pair-calibration-source.json";
    private static final Path OUTPUT = Path.of(
            "src/test/resources/verification/repository-pair-calibration.json");

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GithubRepositoryFilePolicy filePolicy = new GithubRepositoryFilePolicy();
    private final GithubRepositoryFingerprintBuilder fingerprintBuilder =
            new GithubRepositoryFingerprintBuilder(
                    filePolicy,
                    new GithubRepositorySampleSelector(),
                    new ArtifactSemanticFingerprintGenerator());

    @Test
    void refreshesOfflineFingerprintFixtureFromApprovedTemporarySnapshots() throws IOException {
        Path corpusRoot = Path.of(System.getProperty("repositoryCalibrationRoot"));
        RepositoryPairCalibrationSourceManifest source = loadSourceManifest();
        List<RepositoryPairCalibrationDataset.RepositorySnapshot> snapshots = source.snapshots()
                .stream()
                .map(snapshot -> collectSnapshot(corpusRoot, snapshot))
                .toList();
        RepositoryPairCalibrationDataset dataset = new RepositoryPairCalibrationDataset(
                source.datasetVersion(),
                source.fingerprintAlgorithmVersion(),
                source.capturedAt(),
                snapshots,
                source.pairs());

        Files.createDirectories(OUTPUT.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(OUTPUT.toFile(), dataset);

        assertThat(snapshots).allSatisfy(snapshot -> {
            assertThat(snapshot.fingerprint()).isNotNull();
            assertThat(snapshot.fingerprint().isComparable()).isTrue();
        });
    }

    private RepositoryPairCalibrationSourceManifest loadSourceManifest() throws IOException {
        try (InputStream input = getClass().getResourceAsStream(SOURCE_MANIFEST)) {
            if (input == null) {
                throw new IllegalStateException("Missing calibration source manifest");
            }
            return objectMapper.readValue(input, RepositoryPairCalibrationSourceManifest.class);
        }
    }

    private RepositoryPairCalibrationDataset.RepositorySnapshot collectSnapshot(
            Path corpusRoot,
            RepositoryPairCalibrationSourceManifest.SourceSnapshot source
    ) {
        Path repositoryRoot = corpusRoot.resolve(source.localDirectory()).normalize();
        if (!repositoryRoot.startsWith(corpusRoot.normalize()) || !Files.isDirectory(repositoryRoot)) {
            throw new IllegalArgumentException("Missing calibration directory: " + repositoryRoot);
        }
        List<GithubTreeResponse.Entry> tree = listTree(repositoryRoot);
        ArtifactSemanticFingerprint fingerprint = fingerprintBuilder.build(
                tree, path -> readText(repositoryRoot.resolve(path)));
        return new RepositoryPairCalibrationDataset.RepositorySnapshot(
                source.id(),
                source.repositoryUrl(),
                source.revision(),
                source.reviewRole(),
                source.minimumSampledSourceAreas(),
                fingerprint);
    }

    private List<GithubTreeResponse.Entry> listTree(Path repositoryRoot) {
        try (var paths = Files.walk(repositoryRoot)) {
            return paths
                    .filter(Files::isRegularFile)
                    .map(path -> toTreeEntry(repositoryRoot, path))
                    .toList();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to list calibration repository: " + repositoryRoot, exception);
        }
    }

    private GithubTreeResponse.Entry toTreeEntry(Path repositoryRoot, Path path) {
        try {
            String relativePath = repositoryRoot.relativize(path).toString().replace('\\', '/');
            long size = Files.size(path);
            GithubTreeResponse.Entry entry = new GithubTreeResponse.Entry(
                    relativePath, "blob", null, size);
            if (!filePolicy.isEligible(entry)) {
                return entry;
            }
            return new GithubTreeResponse.Entry(
                    relativePath, "blob", gitBlobSha(Files.readAllBytes(path)), size);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to inspect calibration file: " + path, exception);
        }
    }

    private String gitBlobSha(byte[] content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            digest.update(("blob " + content.length + '\0').getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest.digest(content));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-1 is unavailable", exception);
        }
    }

    private String readText(Path path) {
        try {
            return Files.readString(path, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            return null;
        }
    }
}
