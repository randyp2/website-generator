package com.webgen.webgen_backend.util;

import com.webgen.webgen_backend.shared.util.ExternalUrlSafetyValidator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExternalUrlSafetyValidatorTest {

    @Test
    void acceptsPublicHttpsUrl() {
        String normalized = ExternalUrlSafetyValidator
                .normalizeAndValidateExternalUrl("https://93.184.216.34");

        assertThat(normalized).isEqualTo("https://93.184.216.34");
    }

    @Test
    void rejectsMissingUrl() {
        assertThatThrownBy(() -> ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl("  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("externalUrl is required");
    }

    @Test
    void rejectsUnsupportedScheme() {
        assertThatThrownBy(() -> ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl("ftp://example.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("http or https");
    }

    @Test
    void rejectsLocalhost() {
        assertThatThrownBy(() -> ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl("http://localhost:3000"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("public internet host");
    }

    @Test
    void rejectsPrivateIpv4() {
        assertThatThrownBy(() -> ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl("http://10.0.0.12"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("public internet host");
    }

    @Test
    void rejectsLinkLocalMetadataIpv4() {
        assertThatThrownBy(() -> ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl("http://169.254.169.254"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("public internet host");
    }

    @Test
    void allowsBrowserNonNetworkSchemesForRequestFiltering() {
        assertThat(ExternalUrlSafetyValidator.isSafeRequestUrl("about:blank")).isTrue();
        assertThat(ExternalUrlSafetyValidator.isSafeRequestUrl("data:text/plain,hello")).isTrue();
        assertThat(ExternalUrlSafetyValidator.isSafeRequestUrl("blob:https://example.com/123")).isTrue();
    }

    @Test
    void blocksPrivateHttpRequestTargetsForRequestFiltering() {
        assertThat(ExternalUrlSafetyValidator.isSafeRequestUrl("http://127.0.0.1")).isFalse();
        assertThat(ExternalUrlSafetyValidator.isSafeRequestUrl("http://[fc00::1]")).isFalse();
    }
}
