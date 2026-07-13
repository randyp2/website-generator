package com.webgen.webgen_backend.resume_verification_service.scoring.calibration;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;

import java.util.List;

/** Immutable reviewed fingerprint corpus used by the offline repository evaluator. */
record RepositoryPairCalibrationDataset(
        int datasetVersion,
        int fingerprintAlgorithmVersion,
        String capturedAt,
        List<RepositorySnapshot> snapshots,
        List<ReviewedPair> pairs
) {

    record RepositorySnapshot(
            String id,
            String repositoryUrl,
            String revision,
            String reviewRole,
            ArtifactSemanticFingerprint fingerprint
    ) {}

    record ReviewedPair(
            String id,
            String leftSnapshotId,
            String rightSnapshotId,
            boolean sharedLineageGroup,
            Relationship expectedRelationship,
            String reviewNotes
    ) {}

    enum Relationship {
        DUPLICATE,
        DERIVATIVE,
        INDEPENDENT,
        INSUFFICIENT
    }
}
