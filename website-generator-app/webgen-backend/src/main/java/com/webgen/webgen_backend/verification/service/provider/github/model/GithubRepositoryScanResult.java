package com.webgen.webgen_backend.verification.service.provider.github.model;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;

import java.util.Map;

/** Bounded dependency and content signals collected from one repository tree. */
public record GithubRepositoryScanResult(
        Map<String, String> dependencySources,
        ArtifactSemanticFingerprint semanticFingerprint
) {

    public GithubRepositoryScanResult {
        dependencySources = dependencySources == null ? Map.of() : Map.copyOf(dependencySources);
    }

    public static GithubRepositoryScanResult empty() {
        return new GithubRepositoryScanResult(Map.of(), null);
    }
}
