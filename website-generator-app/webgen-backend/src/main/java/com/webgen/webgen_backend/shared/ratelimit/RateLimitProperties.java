package com.webgen.webgen_backend.shared.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

/**
 * Binds the {@code ratelimit.*} block from application.properties.
 *
 * Limits are the backend backstop for cost-heavy endpoints (LLM, screenshot,
 * external APIs): the Next.js proxy applies per-user limits first, these guard
 * against a request that reaches Spring another way. Tune limits here without
 * recompiling; disable the whole layer with {@code ratelimit.enabled=false}.
 */
@ConfigurationProperties(prefix = "ratelimit")
public class RateLimitProperties {

    private boolean enabled = true;
    private Map<String, Policy> policies = new HashMap<>();

    /** A single named limit: {@code limit} requests per {@code windowSeconds}. */
    public static class Policy {
        private int limit;
        private int windowSeconds;

        public int getLimit() {
            return limit;
        }

        public void setLimit(int limit) {
            this.limit = limit;
        }

        public int getWindowSeconds() {
            return windowSeconds;
        }

        public void setWindowSeconds(int windowSeconds) {
            this.windowSeconds = windowSeconds;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Map<String, Policy> getPolicies() {
        return policies;
    }

    public void setPolicies(Map<String, Policy> policies) {
        this.policies = policies;
    }
}
