package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.model.verification.CanonicalSiteUrl;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SiteVerificationUrlCanonicalizerTest {

    private final SiteVerificationUrlCanonicalizer canonicalizer =
            new SiteVerificationUrlCanonicalizer();

    @Test
    void canonicalizesSafeHttpsUrlAndRemovesFragment() {
        CanonicalSiteUrl result = canonicalizer.canonicalize(
                "https://8.8.8.8:443/work/../portfolio?ref=profile#about"
        );

        assertThat(result.verificationUrl())
                .isEqualTo("https://8.8.8.8/portfolio?ref=profile");
        assertThat(result.origin()).isEqualTo("https://8.8.8.8");
    }

    @Test
    void rejectsHttpUrl() {
        assertThatThrownBy(() -> canonicalizer.canonicalize("http://8.8.8.8/portfolio"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must use https");
    }

    @Test
    void rejectsPrivateHost() {
        assertThatThrownBy(() -> canonicalizer.canonicalize("https://127.0.0.1/portfolio"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("public internet host");
    }
}
