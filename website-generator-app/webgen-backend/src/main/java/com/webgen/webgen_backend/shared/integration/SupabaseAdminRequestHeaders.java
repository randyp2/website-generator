package com.webgen.webgen_backend.shared.integration;

import org.springframework.http.HttpHeaders;

/**
 * Creates Supabase admin headers for current opaque keys and legacy JWT keys.
 */
public final class SupabaseAdminRequestHeaders {

    private static final String OPAQUE_SECRET_PREFIX = "sb_secret_";

    private SupabaseAdminRequestHeaders() {
    }

    /**
     * Uses {@code apikey} for every server key and Bearer auth only for legacy JWT keys.
     *
     * @param secretKey trusted server-side Supabase key
     * @return headers accepted by the matching Supabase key format
     */
    public static HttpHeaders create(String secretKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", secretKey);
        if (secretKey != null && !secretKey.startsWith(OPAQUE_SECRET_PREFIX)) {
            headers.setBearerAuth(secretKey);
        }
        return headers;
    }
}
