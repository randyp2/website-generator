import { NextResponse } from "next/server";
import { RateLimiter } from "./rate-limit-types";
import { isRateLimitDisabled } from "./rate-limit-config";

/**
 * Scopes should be fined with this format:
 * <type_of_route>:<user>:<user_id>
 */
export async function enforceRateLimit(
    limiter: RateLimiter,
    key: string,
): Promise<NextResponse | null> {
    if (isRateLimitDisabled()) {
        return null;
    }
    // const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";

    // const key = `${scope}:${ip}`;

    // sucess - true or false
    // limit - amt of requests in this window
    // remaining - amt of requests left in this window
    // reset - timestamp when window resets
    const { success, limit, remaining, reset } = await limiter.limit(key);

    if (!success) {
        return NextResponse.json(
            { error: "Too many requests" },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                },
            },
        );
    }

    return null; // Successful request
}
