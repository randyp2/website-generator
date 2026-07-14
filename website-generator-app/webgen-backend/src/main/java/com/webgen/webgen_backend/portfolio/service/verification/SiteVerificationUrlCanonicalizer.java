package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.model.verification.CanonicalSiteUrl;
import com.webgen.webgen_backend.shared.util.ExternalUrlSafetyValidator;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Locale;

/**
 * Validates and canonicalizes external URLs used for ownership challenges.
 */
@Component
public class SiteVerificationUrlCanonicalizer {

    private static final String HTTPS_SCHEME = "https";
    private static final int HTTPS_DEFAULT_PORT = 443;

    /**
     * Produces a stable HTTPS verification URL without a fragment.
     *
     * @throws IllegalArgumentException when the URL is invalid or unsafe
     */
    public CanonicalSiteUrl canonicalize(String rawUrl) {
        URI submitted = parse(rawUrl);
        if (!HTTPS_SCHEME.equalsIgnoreCase(submitted.getScheme())) {
            throw new IllegalArgumentException("externalUrl must use https for website verification");
        }

        URI safeUri = URI.create(
                ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl(rawUrl)
        );
        String scheme = safeUri.getScheme().toLowerCase(Locale.ROOT);
        String host = safeUri.getHost().toLowerCase(Locale.ROOT);
        int port = safeUri.getPort() == HTTPS_DEFAULT_PORT ? -1 : safeUri.getPort();
        String authorityHost = host.contains(":") && !host.startsWith("[")
                ? "[" + host + "]"
                : host;
        String authority = port < 0 ? authorityHost : authorityHost + ":" + port;
        String rawPath = safeUri.getRawPath();
        String path = rawPath == null || rawPath.isBlank() ? "/" : rawPath;
        String query = safeUri.getRawQuery() == null ? "" : "?" + safeUri.getRawQuery();

        URI verificationUri = URI.create(scheme + "://" + authority + path + query).normalize();
        String origin = scheme + "://" + authority;
        return new CanonicalSiteUrl(verificationUri.toASCIIString(), origin);
    }

    private URI parse(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalArgumentException("externalUrl is required for website verification");
        }
        try {
            return URI.create(rawUrl.trim());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("externalUrl must be a valid URL", exception);
        }
    }
}
