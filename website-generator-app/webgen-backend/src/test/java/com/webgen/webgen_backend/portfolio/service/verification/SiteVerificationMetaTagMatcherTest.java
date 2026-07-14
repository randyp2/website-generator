package com.webgen.webgen_backend.portfolio.service.verification;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SiteVerificationMetaTagMatcherTest {

    private final SiteVerificationMetaTagMatcher matcher =
            new SiteVerificationMetaTagMatcher();

    @Test
    void findsExactTokenInMalformedHtml() {
        String html = """
                <!doctype html>
                <html><head>
                <meta content="wg_v1_expected" name="WEBGEN-SITE-VERIFICATION">
                <title>Portfolio
                </head><body></body></html>
                """;

        assertThat(matcher.containsToken(html, "wg_v1_expected")).isTrue();
    }

    @Test
    void rejectsDifferentToken() {
        String html = """
                <html><head>
                <meta name="webgen-site-verification" content="wg_v1_other">
                </head></html>
                """;

        assertThat(matcher.containsToken(html, "wg_v1_expected")).isFalse();
    }

    @Test
    void ignoresTokenOutsideVerificationMetaElement() {
        String html = "<html><body>wg_v1_expected</body></html>";

        assertThat(matcher.containsToken(html, "wg_v1_expected")).isFalse();
    }
}
