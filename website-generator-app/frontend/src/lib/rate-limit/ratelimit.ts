import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/* ------ Types of Rate Limiters ------ */

// Rate limiter
export const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests for 60 seconds sliding window
    analytics: true,
});

// --- Cheap routes
// Generate cheap routes
export const cheapRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
});

// Upload routes
export const uploadRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: true,
});

// --- Expensive routes
// Generic expensive route
export const expensiveRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, "60 s"),
    analytics: true,
});

// Rate limit for refinement flow
export const refineRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "15 m"),
    analytics: true,
});

// One shot rate limit (backend call, and api calls)
export const generateRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "10 m"),
    analytics: true,
});
