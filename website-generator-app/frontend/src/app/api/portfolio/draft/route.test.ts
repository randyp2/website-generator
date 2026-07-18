import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, fetchMock, getSessionMock } =
    vi.hoisted(() => ({
        createServerSupabaseClientMock: vi.fn(),
        fetchMock: vi.fn(),
        getSessionMock: vi.fn(),
    }));

vi.mock("@/lib/server-env", () => ({
    getBackendUrl: () => "http://backend.test",
}));
vi.mock("@/utils/supabase/server", () => ({
    createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { POST } from "./route";

describe("POST /api/portfolio/draft", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        getSessionMock.mockResolvedValue({
            data: { session: { access_token: "access-token" } },
        });
        createServerSupabaseClientMock.mockResolvedValue({
            auth: { getSession: getSessionMock },
        });
    });

    it("preserves an insufficient-credit response for the credits modal", async () => {
        fetchMock.mockResolvedValue(
            Response.json(
                {
                    detail:
                        "Insufficient credits for portfolio generation. Required: 10, available: 0",
                },
                { status: 402 },
            ),
        );

        const response = await POST(
            new Request("http://localhost/api/portfolio/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId: "blank" }),
            }),
        );

        expect(response.status).toBe(402);
        await expect(response.json()).resolves.toEqual({
            code: "INSUFFICIENT_CREDITS",
            error:
                "Insufficient credits for portfolio generation. Required: 10, available: 0",
        });
        expect(fetchMock).toHaveBeenCalledWith(
            "http://backend.test/api/v1/portfolio/draft",
            expect.objectContaining({
                method: "POST",
                headers: {
                    Authorization: "Bearer access-token",
                    "Content-Type": "application/json",
                },
            }),
        );
    });
});
