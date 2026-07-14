package com.webgen.webgen_backend.portfolio.model.verification;

/**
 * Canonical website verification target and its security origin.
 *
 * @param verificationUrl exact public URL where the verification tag is expected
 * @param origin normalized scheme, host, and optional non-default port
 */
public record CanonicalSiteUrl(String verificationUrl, String origin) {
}
