package com.webgen.webgen_backend.verification.service.fingerprint;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;
import java.util.Objects;

/** Versioned, content-derived identity used to compare source artifacts safely. */
public record ArtifactSemanticFingerprint(
        int algorithmVersion,
        String exactContentHash,
        List<String> sketch,
        int eligibleFileCount,
        int sampledFileCount,
        int tokenCount,
        int shingleCount,
        List<String> sampledPaths
) {

    public ArtifactSemanticFingerprint {
        if (algorithmVersion <= 0) {
            throw new IllegalArgumentException("algorithmVersion must be positive");
        }
        exactContentHash = Objects.requireNonNull(exactContentHash, "exactContentHash");
        if (eligibleFileCount < 0 || sampledFileCount < 0
                || tokenCount < 0 || shingleCount < 0) {
            throw new IllegalArgumentException("fingerprint counts cannot be negative");
        }
        sketch = sketch == null ? List.of() : List.copyOf(sketch);
        sampledPaths = sampledPaths == null ? List.of() : List.copyOf(sampledPaths);
    }

    /** A minimum content floor prevents small scaffolds from being grouped. */
    @JsonIgnore
    public boolean isComparable() {
        return sampledFileCount > 0 && shingleCount >= 40 && !sketch.isEmpty();
    }
}
