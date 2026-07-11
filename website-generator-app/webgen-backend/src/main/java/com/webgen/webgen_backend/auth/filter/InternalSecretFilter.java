package com.webgen.webgen_backend.auth.filter;

import com.webgen.webgen_backend.auth.config.InternalSecretProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Verifies that a request carries the shared internal secret, i.e. that it
 * came from the Next.js server rather than directly from the public internet.
 *
 * Runs before JWTFilter in the chain (see SecurityConfig) so non-frontend
 * traffic is rejected before any auth work. Behaviour is governed by
 * {@link InternalSecretProperties}: disabled when no secret is configured,
 * log-only until {@code internal.api.enforce=true}, then 403 on mismatch.
 * This filter does not touch identity — JWT verification is unchanged.
 */
@Component
@EnableConfigurationProperties(InternalSecretProperties.class)
public class InternalSecretFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(InternalSecretFilter.class);
    private static final String HEADER = "X-Internal-Secret";

    private final InternalSecretProperties properties;

    public InternalSecretFilter(InternalSecretProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Skip entirely when no secret is configured (feature dormant)...
        if (properties.getSecret() == null || properties.getSecret().isBlank())
            return true;

        // ...or for endpoints reached directly by external callers
        String uri = request.getRequestURI();
        return properties.getExemptPaths().stream().anyMatch(uri::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (secretMatches(request.getHeader(HEADER))) {
            chain.doFilter(request, response);
            return;
        }

        if (properties.isEnforce()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Forbidden\"}");
            return;
        }

        // Log-only: record what enforcement WOULD block, but let it through.
        // During rollout every not-yet-migrated route logs here; the list
        // shrinking to zero is the signal that enforce can be turned on.
        log.warn("[INTERNAL-SECRET] would reject {} {} (missing/invalid header)",
                request.getMethod(), request.getRequestURI());
        chain.doFilter(request, response);
    }

    /** Constant-time comparison so a mismatch leaks no timing information. */
    private boolean secretMatches(String provided) {
        if (provided == null)
            return false;
        return MessageDigest.isEqual(
                provided.getBytes(StandardCharsets.UTF_8),
                properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }
}
