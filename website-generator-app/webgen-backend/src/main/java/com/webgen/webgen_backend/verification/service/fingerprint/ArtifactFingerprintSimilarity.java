package com.webgen.webgen_backend.verification.service.fingerprint;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

/** Compares compatible bottom-k sketches using a bounded Jaccard estimate. */
@Component
public class ArtifactFingerprintSimilarity {

    public double compare(
            ArtifactSemanticFingerprint first,
            ArtifactSemanticFingerprint second
    ) {
        if (first == null || second == null
                || first.algorithmVersion() != second.algorithmVersion()
                || !first.isComparable() || !second.isComparable()) {
            return 0.0d;
        }
        if (first.exactContentHash().equals(second.exactContentHash())) {
            return 1.0d;
        }

        Set<String> firstSketch = new HashSet<>(first.sketch());
        Set<String> secondSketch = new HashSet<>(second.sketch());
        TreeSet<String> combined = new TreeSet<>(firstSketch);
        combined.addAll(secondSketch);
        int sampleSize = Math.min(
                Math.min(first.sketch().size(), second.sketch().size()),
                combined.size());
        if (sampleSize == 0) {
            return 0.0d;
        }

        int shared = 0;
        int compared = 0;
        for (String hash : combined) {
            if (compared++ >= sampleSize) {
                break;
            }
            if (firstSketch.contains(hash) && secondSketch.contains(hash)) {
                shared++;
            }
        }
        return (double) shared / sampleSize;
    }
}
