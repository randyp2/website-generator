import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    createServerSupabaseClientMock,
    enforceRateLimitMock,
    fetchMock,
    fromMock,
    getSessionMock,
    getUserMock,
    selectMock,
} = vi.hoisted(() => ({
    createServerSupabaseClientMock: vi.fn(),
    enforceRateLimitMock: vi.fn(),
    fetchMock: vi.fn(),
    fromMock: vi.fn(),
    getSessionMock: vi.fn(),
    getUserMock: vi.fn(),
    selectMock: vi.fn(),
}));

vi.mock("@/lib/server-env", () => ({
    getBackendUrlOrNull: () => "http://backend.test",
}));
vi.mock("@/lib/rate-limit/enable-rate-limit", () => ({
    enforceRateLimit: enforceRateLimitMock,
}));
vi.mock("@/lib/rate-limit/ratelimit", () => ({
    refineRateLimit: {},
}));
vi.mock("@/utils/supabase/admin", () => ({
    adminSupabase: { from: fromMock },
}));
vi.mock("@/utils/supabase/server", () => ({
    createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { POST } from "./route";

const context = {
    params: Promise.resolve({ id: "portfolio-1" }),
};

describe("POST /api/portfolio/[id]/refine/clarify", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        getUserMock.mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
        });
        getSessionMock.mockResolvedValue({
            data: { session: { access_token: "access-token" } },
        });
        createServerSupabaseClientMock.mockResolvedValue({
            auth: {
                getUser: getUserMock,
                getSession: getSessionMock,
            },
        });
        enforceRateLimitMock.mockResolvedValue(null);
        selectMock.mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        });
        fromMock.mockReturnValue({ select: selectMock });
    });

    it("preserves insufficient-credit details for the refinement UI", async () => {
        fetchMock.mockResolvedValue(
            Response.json(
                {
                    detail:
                        "A portfolio refinement allowance or at least 9 credits is required.",
                },
                { status: 402 },
            ),
        );

        const response = await POST(
            new Request("http://localhost/api/portfolio/portfolio-1/refine/clarify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userPrompt: "Update the hero",
                    sections: [],
                    sessionId: null,
                }),
            }),
            context,
        );

        expect(response.status).toBe(402);
        await expect(response.json()).resolves.toEqual({
            code: "INSUFFICIENT_CREDITS",
            error:
                "A portfolio refinement allowance or at least 9 credits is required.",
        });
    });
});
