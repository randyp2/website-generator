import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RateLimiter } from "./rate-limit-types";
import { enforceRateLimit } from "./enable-rate-limit";
import { isRateLimitDisabled } from "./rate-limit-config";

// Mock function to replaced the config dependent function
vi.mock("./rate-limit-config", () => ({
    isRateLimitDisabled: vi.fn(),
}));

const mockedIsRateLimitDisabled = vi.mocked(isRateLimitDisabled);

describe("enforceRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null and skips limiter when rate limiting is disabled", async () => {
        mockedIsRateLimitDisabled.mockReturnValue(true);

        const limiter: RateLimiter = {
            limit: vi.fn(async () => ({
                success: false,
                limit: 10,
                remaining: 0,
                reset: 123,
            })),
        };

        const result = await enforceRateLimit(limiter, "scope:user:123");

        expect(result).toBeNull();
        expect(limiter.limit).not.toHaveBeenCalled();
    });

    it("returns null when limiter allows the request", async () => {
        mockedIsRateLimitDisabled.mockReturnValue(false);

        const limitMock = vi.fn(async () => ({
            success: true,
            limit: 10,
            remaining: 9,
            reset: 1700000000,
        }));

        const limiter: RateLimiter = {
            limit: limitMock,
        };

        const result = await enforceRateLimit(
            limiter,
            "portfolio:ip:127.0.0.1",
        );

        expect(result).toBeNull();
        expect(limitMock).toHaveBeenCalledTimes(1);
        expect(limitMock).toHaveBeenCalledWith("portfolio:ip:127.0.0.1");
    });

    it("returns 429 response with rate-limit headers when blocked", async () => {
        mockedIsRateLimitDisabled.mockReturnValue(false);

        const limiter: RateLimiter = {
            limit: vi.fn(async () => ({
                success: false,
                limit: 2,
                remaining: 0,
                reset: 1700001111,
            })),
        };

        const result = await enforceRateLimit(limiter, "resume:ip:127.0.0.1");

        expect(result).not.toBeNull();
        expect(result?.status).toBe(429);
        expect(result?.headers.get("X-RateLimit-Limit")).toBe("2");
        expect(result?.headers.get("X-RateLimit-Remaining")).toBe("0");
        expect(result?.headers.get("X-RateLimit-Reset")).toBe("1700001111");

        await expect(result?.json()).resolves.toEqual({
            error: "Too many requests",
        });
    });
});
