package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.normalizeForMatch;

// JVM: Maven/Gradle build files
@Component
public class JvmBuildFileParser implements ManifestParser {

    @Override
    public Set<String> supportedFileNames() {
        return Set.of(
                "pom.xml",
                "build.gradle",
                "build.gradle.kts",
                "settings.gradle",
                "settings.gradle.kts");
    }

    @Override
    public Set<String> parse(String content) {
        String normalized = normalizeForMatch(content);
        if (isBlank(normalized)) {
            return Set.of();
        }

        Set<String> signals = new LinkedHashSet<>();
        // Presence of a JVM build file is itself a strong backend indicator.
        addMatchingTerm(signals, "java");
        if (normalized.contains("spring boot")
                || normalized.contains("spring-boot")
                || normalized.contains("org.springframework.boot")) {
            addMatchingTerm(signals, "spring");
            addMatchingTerm(signals, "spring boot");
            addMatchingTerm(signals, "springboot");
        }
        return signals;
    }
}
