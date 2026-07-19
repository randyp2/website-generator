package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;

// Python: requirements.txt
@Component
public class RequirementsTxtParser implements ManifestParser {

    @Override
    public Set<String> supportedFileNames() {
        return Set.of("requirements.txt");
    }

    @Override
    public Set<String> parse(String content) {
        Set<String> dependencies = new LinkedHashSet<>();
        for (String rawLine : content.split("\\R")) {
            String line = rawLine.trim();
            // Skip blanks, comments, and pip options (-r, -e, --hash, ...).
            if (line.isEmpty() || line.startsWith("#") || line.startsWith("-")) {
                continue;
            }
            int inlineComment = line.indexOf('#');
            if (inlineComment >= 0) {
                line = line.substring(0, inlineComment).trim();
            }
            addMatchingTerm(dependencies, RequirementSpecs.packageName(line));
        }
        return dependencies;
    }
}
