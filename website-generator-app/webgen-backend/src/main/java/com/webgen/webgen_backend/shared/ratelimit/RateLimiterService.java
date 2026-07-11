package com.webgen.webgen_backend.shared.ratelimit;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.TimeUnit;

/**
 * Fixed-window rate limiter backed by the shared Redis template.
 *
 * One counter key per (policy, caller) with a TTL of the policy window: the
 * first hit sets the expiry, each hit increments, and exceeding the limit
 * yields HTTP 429. Fixed-window (rather than sliding) is deliberate here — it
 * is a coarse cost cap, not a fairness-critical limiter, and INCR/EXPIRE keeps
 * it to two Redis ops with no extra dependency.
 */
@Service
@EnableConfigurationProperties(RateLimitProperties.class)
public class RateLimiterService {

    private final RedisTemplate<String, String> redisTemplate;
    private final RateLimitProperties properties;

    public RateLimiterService(RedisTemplate<String, String> redisTemplate, RateLimitProperties properties) {
        this.redisTemplate = redisTemplate;
        this.properties = properties;
    }

    /**
     * Enforces the named policy for a caller, throwing 429 when exceeded.
     *
     * @param policyName key into {@code ratelimit.policies.*}
     * @param callerKey  stable per-caller identity (JWT subject / user id)
     * @throws ResponseStatusException 429 when the caller is over the limit
     */
    public void check(String policyName, String callerKey) {
        if (!properties.isEnabled())
            return;

        RateLimitProperties.Policy policy = properties.getPolicies().get(policyName);
        // An unconfigured policy fails open: a missing limit must never block a
        // paying user, and misconfiguration is surfaced by logs, not outages
        if (policy == null || policy.getLimit() <= 0 || policy.getWindowSeconds() <= 0) {
            System.err.println(">>> [RATE-LIMIT] No policy configured for '" + policyName + "' — allowing request");
            return;
        }

        String key = "ratelimit:" + policyName + ":" + callerKey;
        Long count = redisTemplate.opsForValue().increment(key);

        // First hit in this window starts the TTL; also re-arm if a prior crash
        // left the key without one, so a counter can never get stuck full
        if (count != null && (count == 1L || redisTemplate.getExpire(key, TimeUnit.SECONDS) < 0)) {
            redisTemplate.expire(key, policy.getWindowSeconds(), TimeUnit.SECONDS);
        }

        if (count != null && count > policy.getLimit()) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Rate limit exceeded. Please wait a moment and try again.");
        }
    }
}
