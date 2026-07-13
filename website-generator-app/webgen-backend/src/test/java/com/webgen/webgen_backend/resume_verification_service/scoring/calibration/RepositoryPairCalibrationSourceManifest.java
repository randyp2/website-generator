package com.webgen.webgen_backend.resume_verification_service.scoring.calibration;

import java.util.List;

/** Regeneration manifest that maps reviewed provenance to temporary local snapshots. */
record RepositoryPairCalibrationSourceManifest(
        int datasetVersion,
        int fingerprintAlgorithmVersion,
        String capturedAt,
        List<SourceSnapshot> snapshots,
        List<RepositoryPairCalibrationDataset.ReviewedPair> pairs
) {

    record SourceSnapshot(
            String id,
            String localDirectory,
            String repositoryUrl,
            String revision,
            String reviewRole,
            Integer minimumSampledSourceAreas
    ) {}
}
