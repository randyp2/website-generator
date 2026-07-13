package com.webgen.webgen_backend.resume_verification_service.scoring.calibration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/** Runs reviewed public repository snapshots through the production similarity policy. */
@Slf4j
class RepositoryPairCalibrationEvaluationTest {

    private static final String DATASET_RESOURCE =
            "/verification/repository-pair-calibration.json";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RepositoryPairCalibrationEvaluator evaluator =
            new RepositoryPairCalibrationEvaluator();

    @Test
    void reportsRealRepositoryBehaviorAndPreservesSafetyControls() throws IOException {
        RepositoryPairCalibrationDataset dataset = loadDataset();
        assertDatasetIntegrity(dataset);

        RepositoryPairCalibrationEvaluator.EvaluationReport report = evaluator.evaluate(dataset);
        log.info(report.formatReport());
        report.evaluations().stream()
                .filter(evaluation -> !evaluation.exactMatch())
                .forEach(evaluation -> log.info(
                        "repository.calibration.review pair={} expected={} predicted={} notes={}",
                        evaluation.reviewedPair().id(),
                        evaluation.reviewedPair().expectedRelationship(),
                        evaluation.predictedRelationship(),
                        evaluation.reviewedPair().reviewNotes()));

        assertThat(report.evaluations()).hasSize(dataset.pairs().size());
        assertThat(report.evaluations())
                .filteredOn(evaluation -> evaluation.reviewedPair().expectedRelationship()
                        == RepositoryPairCalibrationDataset.Relationship.DUPLICATE)
                .allSatisfy(evaluation -> assertThat(evaluation.predictedRelationship())
                        .isEqualTo(RepositoryPairCalibrationDataset.Relationship.DUPLICATE));
        assertThat(report.evaluations())
                .filteredOn(evaluation -> evaluation.reviewedPair().expectedRelationship()
                        == RepositoryPairCalibrationDataset.Relationship.INDEPENDENT)
                .allSatisfy(evaluation -> assertThat(evaluation.predictedRelationship())
                        .isNotEqualTo(RepositoryPairCalibrationDataset.Relationship.DUPLICATE));
        assertThat(report.evaluations()).allSatisfy(evaluation ->
                assertThat(evaluation.resultingScore()).isBetween(61, 67));
    }

    private RepositoryPairCalibrationDataset loadDataset() throws IOException {
        try (InputStream input = getClass().getResourceAsStream(DATASET_RESOURCE)) {
            if (input == null) {
                throw new IllegalStateException("Missing offline repository calibration dataset");
            }
            return objectMapper.readValue(input, RepositoryPairCalibrationDataset.class);
        }
    }

    private void assertDatasetIntegrity(RepositoryPairCalibrationDataset dataset) {
        assertThat(dataset.datasetVersion()).isEqualTo(1);
        assertThat(dataset.fingerprintAlgorithmVersion())
                .isEqualTo(ArtifactSemanticFingerprintGenerator.ALGORITHM_VERSION);
        assertThat(dataset.snapshots()).hasSizeGreaterThanOrEqualTo(6);
        assertThat(dataset.pairs()).hasSizeGreaterThanOrEqualTo(8);

        Set<String> snapshotIds = new HashSet<>();
        dataset.snapshots().forEach(snapshot -> {
            assertThat(snapshotIds.add(snapshot.id())).isTrue();
            assertThat(snapshot.revision()).matches("[0-9a-f]{40}");
            assertThat(snapshot.repositoryUrl()).startsWith("https://github.com/");
            assertThat(snapshot.repositoryUrl()).endsWith(snapshot.revision());
            assertThat(snapshot.fingerprint()).isNotNull();
            assertThat(snapshot.fingerprint().isComparable()).isTrue();
        });
        dataset.pairs().forEach(pair -> {
            assertThat(snapshotIds).contains(pair.leftSnapshotId(), pair.rightSnapshotId());
            assertThat(pair.reviewNotes()).isNotBlank();
        });
    }
}
