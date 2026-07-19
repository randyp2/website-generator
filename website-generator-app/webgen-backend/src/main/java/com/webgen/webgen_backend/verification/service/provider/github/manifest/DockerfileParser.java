package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;

// Infra: Dockerfile
@Component
public class DockerfileParser implements ManifestParser {

    @Override
    public Set<String> supportedFileNames() {
        return Set.of("Dockerfile");
    }

    @Override
    public Set<String> parse(String content) {
        Set<String> signals = new LinkedHashSet<>();
        // Presence of a Dockerfile implies Docker usage.
        addMatchingTerm(signals, "docker");

        for (String rawLine : content.split("\\R")) {
            String line = rawLine.trim();
            if (line.length() < 5 || !line.regionMatches(true, 0, "FROM ", 0, 5)) {
                continue;
            }
            addMatchingTerm(signals, extractBaseImage(line.substring(5).trim()));
        }
        return signals;
    }

    private String extractBaseImage(String fromArguments) {
        for (String token : fromArguments.split("\\s+")) {
            if (token.isEmpty() || token.startsWith("--")) {
                continue; // skip flags such as --platform=linux/amd64
            }
            // The first non-flag token is the image reference (anything after,
            // e.g. "AS build", is a stage alias).
            return ContainerImages.baseName(token);
        }
        return "";
    }
}
