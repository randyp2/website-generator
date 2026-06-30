package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ManifestDependencyParserTest {

    private final ManifestDependencyParser registry = new ManifestDependencyParser(List.of(
            new PackageJsonParser(new ObjectMapper()),
            new RequirementsTxtParser(),
            new GoModParser(),
            new JvmBuildFileParser()));

    @Test
    void canParseReflectsRegisteredFileNames() {
        assertThat(registry.canParse("package.json")).isTrue();
        assertThat(registry.canParse("requirements.txt")).isTrue();
        assertThat(registry.canParse("go.mod")).isTrue();
        assertThat(registry.canParse("pom.xml")).isTrue();
        assertThat(registry.canParse("README.md")).isFalse();
        assertThat(registry.canParse("Cargo.toml")).isFalse();
    }

    @Test
    void routesEachFileToItsParser() {
        assertThat(registry.parse("requirements.txt", "fastapi==0.110.0\n")).contains("fastapi");
        assertThat(registry.parse("go.mod", "require github.com/gin-gonic/gin v1.9.1\n")).contains("gin");
    }

    @Test
    void returnsEmptyForUnknownOrBlankContent() {
        assertThat(registry.parse("README.md", "anything")).isEmpty();
        assertThat(registry.parse("package.json", null)).isEmpty();
        assertThat(registry.parse("package.json", "   ")).isEmpty();
    }

    @Test
    void rejectsDuplicateFileNameRegistration() {
        ManifestParser first = stubParserFor("dup.txt");
        ManifestParser second = stubParserFor("dup.txt");

        assertThatThrownBy(() -> new ManifestDependencyParser(List.of(first, second)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("dup.txt");
    }

    private ManifestParser stubParserFor(String fileName) {
        return new ManifestParser() {
            @Override
            public Set<String> supportedFileNames() {
                return Set.of(fileName);
            }

            @Override
            public Set<String> parse(String content) {
                return Set.of();
            }
        };
    }
}
