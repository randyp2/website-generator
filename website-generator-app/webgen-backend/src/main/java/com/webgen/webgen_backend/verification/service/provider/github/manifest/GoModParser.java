package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;

// Go: go.mod
@Component
public class GoModParser implements ManifestParser {

    @Override
    public Set<String> supportedFileNames() {
        return Set.of("go.mod");
    }

    @Override
    public Set<String> parse(String content) {
        Set<String> dependencies = new LinkedHashSet<>();
        boolean inRequireBlock = false;
        for (String rawLine : content.split("\\R")) {
            String line = rawLine.trim();
            if (line.isEmpty() || line.startsWith("//")) {
                continue;
            }
            if (!inRequireBlock && line.startsWith("require (")) {
                inRequireBlock = true;
                continue;
            }
            if (inRequireBlock && line.startsWith(")")) {
                inRequireBlock = false;
                continue;
            }

            if (inRequireBlock) {
                addModuleTerms(dependencies, line);
            } else if (line.startsWith("require ")) {
                addModuleTerms(dependencies, line.substring("require ".length()).trim());
            }
        }
        return dependencies;
    }

    private void addModuleTerms(Set<String> dependencies, String requireSpec) {
        String modulePath = requireSpec.split("\\s+", 2)[0];
        if (modulePath.isEmpty()) {
            return;
        }
        addMatchingTerm(dependencies, modulePath);
        // Also emit the trailing segment so a module like github.com/x/gin can
        // match a skill named "gin".
        int lastSlash = modulePath.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < modulePath.length() - 1) {
            addMatchingTerm(dependencies, modulePath.substring(lastSlash + 1));
        }
    }
}
