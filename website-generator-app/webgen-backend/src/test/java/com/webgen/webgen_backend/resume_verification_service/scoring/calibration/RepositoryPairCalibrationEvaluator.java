package com.webgen.webgen_backend.resume_verification_service.scoring.calibration;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactFingerprintSimilarity;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.provider.github.GithubRepositoryNoveltyPolicy;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Evaluates reviewed repository pairs without mutating production scoring policy. */
final class RepositoryPairCalibrationEvaluator {

    private final ArtifactFingerprintSimilarity similarity;
    private final GithubRepositoryNoveltyPolicy noveltyPolicy;
    private final ScoringCalibrationHarness scoringHarness;

    RepositoryPairCalibrationEvaluator() {
        this.similarity = new ArtifactFingerprintSimilarity();
        this.noveltyPolicy = new GithubRepositoryNoveltyPolicy();
        this.scoringHarness = new ScoringCalibrationHarness();
    }

    EvaluationReport evaluate(RepositoryPairCalibrationDataset dataset) {
        Map<String, RepositoryPairCalibrationDataset.RepositorySnapshot> snapshotsById =
                new LinkedHashMap<>();
        dataset.snapshots().forEach(snapshot -> snapshotsById.put(snapshot.id(), snapshot));

        List<PairEvaluation> evaluations = dataset.pairs().stream()
                .map(pair -> evaluatePair(pair, snapshotsById))
                .toList();
        return EvaluationReport.from(evaluations);
    }

    private PairEvaluation evaluatePair(
            RepositoryPairCalibrationDataset.ReviewedPair pair,
            Map<String, RepositoryPairCalibrationDataset.RepositorySnapshot> snapshotsById
    ) {
        RepositoryPairCalibrationDataset.RepositorySnapshot left = requiredSnapshot(
                snapshotsById, pair.leftSnapshotId());
        RepositoryPairCalibrationDataset.RepositorySnapshot right = requiredSnapshot(
                snapshotsById, pair.rightSnapshotId());
        double sharedContent = similarity.compare(left.fingerprint(), right.fingerprint());
        RepositoryPairCalibrationDataset.Relationship predicted = classify(
                pair.sharedLineageGroup(), left.fingerprint(), right.fingerprint(), sharedContent);
        BigDecimal additionalWeight = additionalWeight(
                predicted, sharedContent, pair.sharedLineageGroup());
        int resultingScore = scorePair(pair.id(), predicted, additionalWeight);
        return new PairEvaluation(
                pair,
                predicted,
                sharedContent,
                BigDecimal.ONE.subtract(BigDecimal.valueOf(sharedContent)),
                additionalWeight,
                resultingScore);
    }

    private RepositoryPairCalibrationDataset.RepositorySnapshot requiredSnapshot(
            Map<String, RepositoryPairCalibrationDataset.RepositorySnapshot> snapshotsById,
            String snapshotId
    ) {
        RepositoryPairCalibrationDataset.RepositorySnapshot snapshot = snapshotsById.get(snapshotId);
        if (snapshot == null) {
            throw new IllegalArgumentException("Unknown calibration snapshot: " + snapshotId);
        }
        return snapshot;
    }

    private RepositoryPairCalibrationDataset.Relationship classify(
            boolean sharedLineageGroup,
            ArtifactSemanticFingerprint left,
            ArtifactSemanticFingerprint right,
            double sharedContent
    ) {
        if (left == null || right == null || !left.isComparable() || !right.isComparable()) {
            return RepositoryPairCalibrationDataset.Relationship.INSUFFICIENT;
        }
        if (sharedContent >= GithubRepositoryNoveltyPolicy.DUPLICATE_SIMILARITY_THRESHOLD) {
            return RepositoryPairCalibrationDataset.Relationship.DUPLICATE;
        }
        if (sharedLineageGroup
                || sharedContent >= GithubRepositoryNoveltyPolicy.DERIVATIVE_SIMILARITY_THRESHOLD) {
            return RepositoryPairCalibrationDataset.Relationship.DERIVATIVE;
        }
        return RepositoryPairCalibrationDataset.Relationship.INDEPENDENT;
    }

    private BigDecimal additionalWeight(
            RepositoryPairCalibrationDataset.Relationship predicted,
            double sharedContent,
            boolean sharedLineageGroup
    ) {
        return switch (predicted) {
            case DUPLICATE -> BigDecimal.ZERO;
            case DERIVATIVE -> sharedLineageGroup
                    ? noveltyPolicy.lineageIndependenceWeight(sharedContent)
                    : noveltyPolicy.independenceWeight(sharedContent);
            case INDEPENDENT, INSUFFICIENT -> BigDecimal.ONE;
        };
    }

    private int scorePair(
            String pairId,
            RepositoryPairCalibrationDataset.Relationship predicted,
            BigDecimal additionalWeight
    ) {
        String secondaryGroup = predicted == RepositoryPairCalibrationDataset.Relationship.DUPLICATE
                ? "pair-primary"
                : "pair-secondary";
        ScoringCalibrationHarness.EvidenceSpec primary = githubEvidence(
                "primary", "pair-primary", BigDecimal.ONE);
        ScoringCalibrationHarness.EvidenceSpec secondary = githubEvidence(
                "secondary", secondaryGroup, additionalWeight.max(BigDecimal.ZERO));
        ScoringCalibrationHarness.CalibrationScenario scenario =
                new ScoringCalibrationHarness.CalibrationScenario(
                        "repository_pair_" + pairId,
                        "Repository pair score implication",
                        List.of(new ScoringCalibrationHarness.ClaimSpec(
                                "React", List.of(primary, secondary))));
        return scoringHarness.run(scenario).overallScore();
    }

    private ScoringCalibrationHarness.EvidenceSpec githubEvidence(
            String label,
            String group,
            BigDecimal independenceWeight
    ) {
        return new ScoringCalibrationHarness.EvidenceSpec(
                label,
                "github",
                "repository",
                "github:" + group,
                "dependency_match",
                new BigDecimal("0.90"),
                null,
                BigDecimal.ONE,
                independenceWeight,
                0);
    }

    record PairEvaluation(
            RepositoryPairCalibrationDataset.ReviewedPair reviewedPair,
            RepositoryPairCalibrationDataset.Relationship predictedRelationship,
            double sharedContentEstimate,
            BigDecimal novelContentEstimate,
            BigDecimal additionalIndependenceWeight,
            int resultingScore
    ) {
        boolean exactMatch() {
            return reviewedPair.expectedRelationship() == predictedRelationship;
        }

        String formatRow() {
            return "|" + reviewedPair.id()
                    + "|" + reviewedPair.expectedRelationship()
                    + "|" + predictedRelationship
                    + "|" + (reviewedPair.sharedLineageGroup() ? "yes" : "no")
                    + "|" + String.format(Locale.ROOT, "%.3f", sharedContentEstimate)
                    + "|" + additionalIndependenceWeight
                    + "|" + resultingScore
                    + "|" + (exactMatch() ? "yes" : "review") + "|";
        }
    }

    record EvaluationReport(
            List<PairEvaluation> evaluations,
            int exactMatches,
            int falseDuplicates,
            int falseIndependents
    ) {
        static EvaluationReport from(List<PairEvaluation> evaluations) {
            int exactMatches = (int) evaluations.stream().filter(PairEvaluation::exactMatch).count();
            int falseDuplicates = (int) evaluations.stream()
                    .filter(evaluation -> evaluation.predictedRelationship()
                            == RepositoryPairCalibrationDataset.Relationship.DUPLICATE)
                    .filter(evaluation -> evaluation.reviewedPair().expectedRelationship()
                            != RepositoryPairCalibrationDataset.Relationship.DUPLICATE)
                    .count();
            int falseIndependents = (int) evaluations.stream()
                    .filter(evaluation -> evaluation.predictedRelationship()
                            == RepositoryPairCalibrationDataset.Relationship.INDEPENDENT
                            || evaluation.predictedRelationship()
                            == RepositoryPairCalibrationDataset.Relationship.INSUFFICIENT)
                    .filter(evaluation -> evaluation.reviewedPair().expectedRelationship()
                            == RepositoryPairCalibrationDataset.Relationship.DUPLICATE
                            || evaluation.reviewedPair().expectedRelationship()
                            == RepositoryPairCalibrationDataset.Relationship.DERIVATIVE)
                    .count();
            return new EvaluationReport(
                    List.copyOf(evaluations), exactMatches, falseDuplicates, falseIndependents);
        }

        String formatReport() {
            StringBuilder report = new StringBuilder("\n[REPOSITORY PAIR CALIBRATION]\n")
                    .append("| Pair | Expected | Predicted | Lineage | Shared | Added weight | Score | Match |\n")
                    .append("|---|---|---|---|---:|---:|---:|---|\n");
            evaluations.forEach(evaluation -> report.append(evaluation.formatRow()).append('\n'));
            return report.append("exactMatches=").append(exactMatches)
                    .append('/').append(evaluations.size())
                    .append(" falseDuplicates=").append(falseDuplicates)
                    .append(" falseIndependents=").append(falseIndependents)
                    .toString();
        }
    }
}
