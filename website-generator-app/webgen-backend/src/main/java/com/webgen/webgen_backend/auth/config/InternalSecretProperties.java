package com.webgen.webgen_backend.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Binds the {@code internal.api.*} block: the shared secret the Next.js server
 * attaches to every backend call, so Spring can reject requests that did not
 * originate from the frontend.
 *
 * Rollout is two-phase via {@link #enforce}:
 * - false (default): log-only. Mismatches are logged but allowed through, so
 *   the header can be rolled out across the frontend with zero risk.
 * - true: mismatches are rejected with 403.
 *
 * A blank {@link #secret} disables the check entirely (local dev / envs that
 * have not set the var), so this can ship dormant until the secret is present.
 */
@ConfigurationProperties(prefix = "internal.api")
public class InternalSecretProperties {

    private String secret = "";
    private boolean enforce = false;

    /**
     * Paths reached directly by external callers (not via the frontend), which
     * therefore cannot carry the secret: the ALB health check and the Stripe
     * webhook (itself protected by Stripe signature verification). Matched as
     * prefixes against the request URI.
     */
    private List<String> exemptPaths = List.of(
            "/api/generate/ping",
            "/api/v1/billing/webhook/stripe"
    );

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public boolean isEnforce() {
        return enforce;
    }

    public void setEnforce(boolean enforce) {
        this.enforce = enforce;
    }

    public List<String> getExemptPaths() {
        return exemptPaths;
    }

    public void setExemptPaths(List<String> exemptPaths) {
        this.exemptPaths = exemptPaths;
    }
}
