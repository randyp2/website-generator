import { redis } from "./redis";

export async function acquireLock(
    key: string,
    ttlSeconds: number,
): Promise<boolean> {
    const result = await redis.set(key, "1", {
        nx: true, // Only set if key doesnt exist
        ex: ttlSeconds, // auto-expire
    });

    return result === "OK";
}

export async function releaseLock(key: string) {
    await redis.del(key);
}
