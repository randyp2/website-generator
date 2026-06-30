package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import java.util.Set;

/**
 * Extracts skill signal terms from one or more repository manifest file formats.
 * Implementations are auto-discovered and indexed by {@link ManifestDependencyParser}.
 */
public interface ManifestParser {

    /** File names this parser handles (e.g. "go.mod", or the several JVM build files). */
    Set<String> supportedFileNames();

    /** Parses manifest contents into normalized skill signal terms. */
    Set<String> parse(String content);
}
