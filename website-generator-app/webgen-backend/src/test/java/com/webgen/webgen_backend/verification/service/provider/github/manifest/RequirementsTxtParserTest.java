package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RequirementsTxtParserTest {

    private final RequirementsTxtParser parser = new RequirementsTxtParser();

    @Test
    void supportsRequirementsTxt() {
        assertThat(parser.supportedFileNames()).containsExactly("requirements.txt");
    }

    @Test
    void parsesNamesIgnoringVersionsCommentsAndOptions() {
        String requirements = """
                # core deps
                fastapi==0.110.0
                uvicorn[standard]>=0.29
                requests
                -r other.txt
                -e .
                django>=4 ; python_version >= "3.8"  # web
                """;
        Set<String> deps = parser.parse(requirements);
        assertThat(deps).contains("fastapi", "uvicorn", "requests", "django");
        assertThat(deps).doesNotContain("other.txt");
    }
}
