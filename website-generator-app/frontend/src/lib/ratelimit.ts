import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Connect to upstash
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter
export const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests for 60 seconds sliding window
    analytics: true,
});
