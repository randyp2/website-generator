package com.webgen.webgen_backend.portfolio.service.verification;

/** Shared identifiers used by the PortRN site ownership protocol. */
final class SiteVerificationProtocol {

    static final String META_NAME = "portrn-site-verification";
    static final String USER_AGENT = "PortRN-Site-Verifier/1.0";

    private SiteVerificationProtocol() {
    }

    static String buildMetaTag(String challengeToken) {
        return "<meta name=\"%s\" content=\"%s\">".formatted(
                META_NAME,
                challengeToken
        );
    }
}
