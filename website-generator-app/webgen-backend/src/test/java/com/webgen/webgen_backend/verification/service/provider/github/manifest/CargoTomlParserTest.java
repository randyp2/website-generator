package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CargoTomlParserTest {

    private final CargoTomlParser parser = new CargoTomlParser();

    @Test
    void supportsCargoToml() {
        assertThat(parser.supportedFileNames()).containsExactly("Cargo.toml");
    }

    @Test
    void parsesDependencyTablesIncludingInlineTables() {
        String cargo = """
                [package]
                name = "app"

                [dependencies]
                serde = "1.0"
                tokio = { version = "1", features = ["full"] }

                [dev-dependencies]
                criterion = "0.5"
                """;
        assertThat(parser.parse(cargo)).contains("serde", "tokio", "criterion");
    }

    @Test
    void returnsEmptyForInvalidToml() {
        assertThat(parser.parse("this is not = valid = toml =")).isEmpty();
    }
}
