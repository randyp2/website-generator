package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PackageJsonParserTest {

    private final PackageJsonParser parser = new PackageJsonParser(new ObjectMapper());

    @Test
    void supportsPackageJson() {
        assertThat(parser.supportedFileNames()).containsExactly("package.json");
    }

    @Test
    void parsesEveryDependencySection() {
        String json = """
                {
                  "dependencies": { "react": "^18.0.0" },
                  "devDependencies": { "jest": "^29.0.0" },
                  "peerDependencies": { "next": "14" },
                  "optionalDependencies": { "fsevents": "2" }
                }
                """;
        assertThat(parser.parse(json)).contains("react", "jest", "next", "fsevents");
    }

    @Test
    void returnsEmptyForInvalidJson() {
        assertThat(parser.parse("not json at all")).isEmpty();
    }
}
