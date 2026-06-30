package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class DockerComposeParserTest {

    private final DockerComposeParser parser = new DockerComposeParser();

    @Test
    void supportsComposeFileNames() {
        assertThat(parser.supportedFileNames()).containsExactlyInAnyOrder(
                "docker-compose.yml",
                "docker-compose.yaml",
                "compose.yml",
                "compose.yaml");
    }

    @Test
    void extractsServiceImagesAndReportsDocker() {
        String compose = """
                services:
                  db:
                    image: postgres:15
                  cache:
                    image: redis:7-alpine
                  api:
                    build: ./api
                """;
        Set<String> signals = parser.parse(compose);
        assertThat(signals).contains("docker", "postgres", "redis");
    }

    @Test
    void returnsEmptyForInvalidYaml() {
        assertThat(parser.parse("\tnot: [valid")).isEmpty();
    }
}
