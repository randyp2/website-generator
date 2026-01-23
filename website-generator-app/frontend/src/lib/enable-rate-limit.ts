import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "./ratelimit";

/**
 * Scopes should be fined with this format:
 * <type_of_route>:<user>:<user_id>
 */
export async function enforceRateLimit(
    req: NextRequest,
    scope: string,
): Promise<NextResponse | null> {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";

    const key = `${scope}:${ip}`;

    // sucess - true or false
    // limit - amt of requests in this window
    // remaining - amt of requests left in this window
    // reset - timestamp when window resets
    const { success, limit, remaining, reset } = await ratelimit.limit(key);

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
