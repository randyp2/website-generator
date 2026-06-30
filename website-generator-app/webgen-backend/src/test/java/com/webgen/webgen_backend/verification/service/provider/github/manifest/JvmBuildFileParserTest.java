package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JvmBuildFileParserTest {

    private final JvmBuildFileParser parser = new JvmBuildFileParser();

    @Test
    void supportsMavenAndGradleBuildFiles() {
        assertThat(parser.supportedFileNames()).containsExactlyInAnyOrder(
                "pom.xml",
                "build.gradle",
                "build.gradle.kts",
                "settings.gradle",
                "settings.gradle.kts");
    }

    @Test
    void detectsJavaAndSpringSignals() {
        String pom = "<project><dependency>"
                + "<groupId>org.springframework.boot</groupId>"
                + "</dependency></project>";
        assertThat(parser.parse(pom)).contains("java", "spring boot");
    }
}
