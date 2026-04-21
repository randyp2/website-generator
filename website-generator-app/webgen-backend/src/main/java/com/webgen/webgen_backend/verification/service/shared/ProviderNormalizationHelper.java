package com.webgen.webgen_backend.verification.service.shared;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Set;

public final class ProviderNormalizationHelper {

    private ProviderNormalizationHelper() {}

    // Normalize provider input and enforce support list.
    public static String normalizeProvider(
            String provider,
            Set<String> supportedProviders
    ) {
        if (provider == null || provider.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "provider is required");
        }

        String normalized = provider.trim().toLowerCase(Locale.ROOT);
        if (!supportedProviders.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported provider: " + normalized);
        }

        return normalized;
    }
}
