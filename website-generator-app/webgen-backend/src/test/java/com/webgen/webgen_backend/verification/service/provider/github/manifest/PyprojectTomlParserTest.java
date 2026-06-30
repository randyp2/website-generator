package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PyprojectTomlParserTest {

    private final PyprojectTomlParser parser = new PyprojectTomlParser();

    @Test
    void supportsPyprojectToml() {
        assertThat(parser.supportedFileNames()).containsExactly("pyproject.toml");
    }

    @Test
    void parsesPep621DependenciesAndOptionalGroups() {
        String pyproject = """
                [project]
                name = "app"
                dependencies = ["fastapi>=0.110", "uvicorn[standard]"]

                [project.optional-dependencies]
                test = ["pytest>=8", "httpx"]
                """;
        assertThat(parser.parse(pyproject)).contains("fastapi", "uvicorn", "pytest", "httpx");
    }

    @Test
    void parsesPoetryDependenciesExcludingPythonConstraint() {
        String pyproject = """
                [tool.poetry.dependencies]
                python = "^3.11"
                django = "^5.0"
                requests = { version = "^2.31", extras = ["socks"] }

                [tool.poetry.dev-dependencies]
                black = "^24.0"
                """;
        assertThat(parser.parse(pyproject)).contains("django", "requests", "black");
        assertThat(parser.parse(pyproject)).doesNotContain("python");
    }
}
