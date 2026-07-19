package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;

// Infra: docker-compose.yml / compose.yml
@Component
public class DockerComposeParser implements ManifestParser {

    private final YAMLMapper yamlMapper = new YAMLMapper();

    @Override
    public Set<String> supportedFileNames() {
        return Set.of(
                "docker-compose.yml",
                "docker-compose.yaml",
                "compose.yml",
                "compose.yaml");
    }

    @Override
    public Set<String> parse(String content) {
        try {
            JsonNode root = yamlMapper.readTree(content);
            if (root == null || !root.isObject()) {
                return Set.of();
            }

            Set<String> signals = new LinkedHashSet<>();
            // A compose file implies Docker usage.
            addMatchingTerm(signals, "docker");

            JsonNode services = root.get("services");
            if (services != null && services.isObject()) {
                services.forEach(service -> {
                    JsonNode image = service.get("image");
                    if (image != null && image.isTextual()) {
                        addMatchingTerm(signals, ContainerImages.baseName(image.asText()));
                    }
                });
            }
            return signals;
        } catch (Exception exception) {
            return Set.of();
        }
    }
}
