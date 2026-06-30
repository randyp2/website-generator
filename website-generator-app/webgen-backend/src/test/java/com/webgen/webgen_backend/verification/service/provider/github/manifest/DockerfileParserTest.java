package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DockerfileParserTest {

    private final DockerfileParser parser = new DockerfileParser();

    @Test
    void supportsDockerfile() {
        assertThat(parser.supportedFileNames()).containsExactly("Dockerfile");
    }

    @Test
    void detectsDockerAndBaseImagesAcrossStages() {
        String dockerfile = """
                FROM --platform=linux/amd64 node:20-alpine AS build
                RUN npm ci
                FROM postgres:15
                FROM mcr.microsoft.com/dotnet/sdk:8.0
                """;
        assertThat(parser.parse(dockerfile)).contains("docker", "node", "postgres", "sdk");
    }

    @Test
    void skipsScratchButStillReportsDocker() {
        assertThat(parser.parse("FROM scratch\n")).containsExactly("docker");
    }
}
