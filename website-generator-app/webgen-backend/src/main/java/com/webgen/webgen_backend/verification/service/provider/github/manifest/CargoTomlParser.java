package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.toml.TomlMapper;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;

// Rust: Cargo.toml
@Component
public class CargoTomlParser implements ManifestParser {

    private static final List<String> DEPENDENCY_TABLES = List.of(
            "dependencies",
            "dev-dependencies",
            "build-dependencies");

    private final TomlMapper tomlMapper = new TomlMapper();

    @Override
    public Set<String> supportedFileNames() {
        return Set.of("Cargo.toml");
    }

    @Override
    public Set<String> parse(String content) {
        try {
            JsonNode root = tomlMapper.readTree(content);
            if (root == null || !root.isObject()) {
                return Set.of();
            }
            Set<String> dependencies = new LinkedHashSet<>();
            for (String table : DEPENDENCY_TABLES) {
                JsonNode node = root.get(table);
                if (node == null || !node.isObject()) {
                    continue;
                }
                // Each table maps crate name -> version (or inline table); the
                // field name is the crate name in both cases.
                node.fieldNames().forEachRemaining(crate -> addMatchingTerm(dependencies, crate));
            }
            return dependencies;
        } catch (Exception exception) {
            return Set.of();
        }
    }
}
