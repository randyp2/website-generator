import { redis } from "./redis";
import { isRateLimitDisabled } from "./rate-limit-config";

/**
 * ===================================================================
 * Helper functions for distributed locking
 * Acquire lock w/ specified TTL
 * Release lock when job finished before TTL expired
 * ===================================================================
 */
export const acquireLock = async (
    key: string,
    ttlSeconds: number,
): Promise<boolean> => {
    if (isRateLimitDisabled()) {
        return true;
    }

    if (!redis) {
        throw new Error("Redis client is not configured");
    }

    const result = await redis.set(key, "1", {
        nx: true, // Only set if key doesnt exist
        ex: ttlSeconds, // auto-expire
    });

    return result === "OK";
};

export const releaseLock = async (key: string) => {
    if (isRateLimitDisabled()) {
        return;
    }

    if (!redis) {
        throw new Error("Redis client is not configured");
    }

    await redis.del(key);
};
