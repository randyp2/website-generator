import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import { isRateLimitDisabled } from "./rate-limit-config";
import { RateLimiter } from "./rate-limit-types";

/*
 * Disabled no-op limiter used when `DISABLE_RATE_LIMIT=true`.
 *
 * Keeps call sites simple by returning a successful limiter result shape.
 * This means route handlers can always call `enforceRateLimit(...)` without
 * branching on environment state.
 */
const disabledLimiter: RateLimiter = {
    limit: async () => ({
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
    }),
};

const isDisabled = isRateLimitDisabled();

/*
 * Lazily resolve Redis only when rate limiting is enabled.
 *
 * Why lazy:
 * - avoids eager Redis access in local/dev when limits are disabled
 * - fails fast with a clear error if limits are enabled but Redis is missing
 */
const getRedis = () => {
    if (!redis) {
        throw new Error("Redis client is not configured");
    }

    return redis;
};

/* ===================================================================
 * RATE LIMITER BUCKETS BY ROUTE COST / ABUSE RISK
 * ===================================================================
 * `cheapRateLimit`:
 *   - Lightweight checks and read-ish endpoints
 *
 * `uploadRateLimit`:
 *   - Upload and create endpoints that can generate storage churn
 *
 * `expensiveRateLimit`:
 *   - CPU-heavy or third-party API dependent routes
 *
 * `refineRateLimit`:
 *   - Multi-step refine chat flow; higher limit for iterative UX
 *
 * `generateRateLimit`:
 *   - One-shot generation/build operations with higher compute cost
 * ===================================================================
 */

/* --- Generic default limiter (10 req / 60s) ---
 * Baseline limiter kept as a shared default.
 * Note: currently not imported by route handlers.
 */
export const ratelimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests for 60 seconds sliding window
          analytics: true,
      });

/* --- Cheap routes limiter (10 req / 60s) ---
 * Used for low-cost endpoints where moderate burst traffic is acceptable.
 */
export const cheapRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(10, "60 s"),
          analytics: true,
      });

/* --- Upload/create routes limiter (20 req / 60s) ---
 * Slightly higher throughput for user upload flows.
 */
export const uploadRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(20, "60 s"),
          analytics: true,
      });

/* --- Expensive routes limiter (2 req / 60s) ---
 * Tight throttle for costly endpoints (e.g., parsing/generation helpers).
 */
export const expensiveRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(2, "60 s"),
          analytics: true,
      });

/* --- Refinement flow limiter (30 req / 15m) ---
 * Supports back-and-forth chat iterations while still capping abuse.
 */
export const refineRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(30, "15 m"),
          analytics: true,
      });

/* --- One-shot generation/build limiter (1 req / 10m) ---
 * Strict guard for high-cost, backend-heavy generation actions.
 */
export const generateRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(1, "10 m"),
          analytics: true,
      });
