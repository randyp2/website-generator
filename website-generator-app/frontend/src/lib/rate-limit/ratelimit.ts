import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import { isRateLimitDisabled } from "./rate-limit-config";
import { RateLimiter } from "./rate-limit-types";

const disabledLimiter: RateLimiter = {
    limit: async () => ({
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
    }),
};

const isDisabled = isRateLimitDisabled();

const getRedis = () => {
    if (!redis) {
        throw new Error("Redis client is not configured");
    }

    return redis;
};

/* ------ Types of Rate Limiters ------ */

// Rate limiter
export const ratelimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests for 60 seconds sliding window
          analytics: true,
      });

// --- Cheap routes
// Generate cheap routes
export const cheapRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(10, "60 s"),
          analytics: true,
      });

// Upload routes
export const uploadRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(20, "60 s"),
          analytics: true,
      });

// --- Expensive routes
// Generic expensive route
export const expensiveRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(2, "60 s"),
          analytics: true,
      });

// Rate limit for refinement flow
export const refineRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(30, "15 m"),
          analytics: true,
      });

// One shot rate limit (backend call, and api calls)
export const generateRateLimit: RateLimiter = isDisabled
    ? disabledLimiter
    : new Ratelimit({
          redis: getRedis(),
          limiter: Ratelimit.slidingWindow(1, "10 m"),
          analytics: true,
      });
