package com.webgen.webgen_backend.shared.ratelimit;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Resolves the caller's IP for rate-limiting public (unauthenticated) routes.
 *
 * Prefers the first entry of X-Forwarded-For (set by the Next.js proxy /
 * load balancer in front of the app), falling back to the socket address.
 */
public final class ClientIp {

    private ClientIp() {
    }

    /** Returns a rate-limit key of the form {@code "ip:<address>"}. */
    public static String key(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim()
                : request.getRemoteAddr();
        return "ip:" + ip;
    }
}
