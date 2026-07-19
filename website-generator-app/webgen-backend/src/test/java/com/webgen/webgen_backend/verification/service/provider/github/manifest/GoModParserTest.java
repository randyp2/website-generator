package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GoModParserTest {

    private final GoModParser parser = new GoModParser();

    @Test
    void supportsGoMod() {
        assertThat(parser.supportedFileNames()).containsExactly("go.mod");
    }

    @Test
    void parsesRequireBlockAndSingleLineUsingTrailingSegment() {
        String goMod = """
                module example.com/app

                go 1.21

                require (
                    github.com/gin-gonic/gin v1.9.1 // indirect
                    github.com/spf13/cobra v1.7.0
                )

                require github.com/stretchr/testify v1.8.4
                """;
        assertThat(parser.parse(goMod)).contains("gin", "cobra", "testify");
    }
}
