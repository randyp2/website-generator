package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.toml.TomlMapper;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;

// Python: pyproject.toml (supports both PEP 621 and Poetry layouts)
@Component
public class PyprojectTomlParser implements ManifestParser {

    private final TomlMapper tomlMapper = new TomlMapper();

    @Override
    public Set<String> supportedFileNames() {
        return Set.of("pyproject.toml");
    }

    @Override
    public Set<String> parse(String content) {
        try {
            JsonNode root = tomlMapper.readTree(content);
            if (root == null || !root.isObject()) {
                return Set.of();
            }
            Set<String> dependencies = new LinkedHashSet<>();
            collectPep621Dependencies(root, dependencies);
            collectPoetryDependencies(root, dependencies);
            return dependencies;
        } catch (Exception exception) {
            return Set.of();
        }
    }

    // PEP 621: [project] dependencies + [project.optional-dependencies], both
    // holding lists of requirement strings like "fastapi>=0.110".
    private void collectPep621Dependencies(JsonNode root, Set<String> dependencies) {
        JsonNode project = root.path("project");
        if (!project.isObject()) {
            return;
        }
        addRequirementSpecs(project.get("dependencies"), dependencies);
        JsonNode optional = project.get("optional-dependencies");
        if (optional != null && optional.isObject()) {
            optional.forEach(group -> addRequirementSpecs(group, dependencies));
        }
    }

    // Poetry: [tool.poetry.dependencies] tables keyed by package name.
    private void collectPoetryDependencies(JsonNode root, Set<String> dependencies) {
        JsonNode poetry = root.path("tool").path("poetry");
        if (!poetry.isObject()) {
            return;
        }
        addTableKeys(poetry.get("dependencies"), dependencies);
        addTableKeys(poetry.get("dev-dependencies"), dependencies);
    }

    private void addRequirementSpecs(JsonNode arrayNode, Set<String> dependencies) {
        if (arrayNode == null || !arrayNode.isArray()) {
            return;
        }
        for (JsonNode entry : arrayNode) {
            if (entry.isTextual()) {
                addMatchingTerm(dependencies, RequirementSpecs.packageName(entry.asText()));
            }
        }
    }

    private void addTableKeys(JsonNode tableNode, Set<String> dependencies) {
        if (tableNode == null || !tableNode.isObject()) {
            return;
        }
        // Poetry lists the interpreter itself (python = "^3.11") in this table;
        // it is a constraint, not a package.
        tableNode.fieldNames().forEachRemaining(name -> {
            if (!"python".equalsIgnoreCase(name)) {
                addMatchingTerm(dependencies, name);
            }
        });
    }
}
