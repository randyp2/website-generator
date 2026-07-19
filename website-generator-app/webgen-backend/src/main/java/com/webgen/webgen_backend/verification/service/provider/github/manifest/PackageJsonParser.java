package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;

// npm: package.json
@Component
@RequiredArgsConstructor
public class PackageJsonParser implements ManifestParser {

    private static final List<String> DEPENDENCY_SECTIONS = List.of(
            "dependencies",
            "devDependencies",
            "peerDependencies",
            "optionalDependencies");

    private final ObjectMapper objectMapper;

    @Override
    public Set<String> supportedFileNames() {
        return Set.of("package.json");
    }

    @Override
    public Set<String> parse(String content) {
        try {
            JsonNode root = objectMapper.readTree(content);
            if (root == null || !root.isObject()) {
                return Set.of();
            }
            Set<String> dependencies = new LinkedHashSet<>();
            for (String section : DEPENDENCY_SECTIONS) {
                JsonNode node = root.get(section);
                if (node == null || !node.isObject()) {
                    continue;
                }
                node.fieldNames().forEachRemaining(dependency -> addMatchingTerm(dependencies, dependency));
            }
            return dependencies;
        } catch (Exception exception) {
            return Set.of();
        }
    }
}
