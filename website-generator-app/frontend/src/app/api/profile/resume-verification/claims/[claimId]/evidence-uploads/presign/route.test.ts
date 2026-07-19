import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    createServerSupabaseClientMock,
    fetchMock,
    getSessionMock,
    getUserMock,
} = vi.hoisted(() => ({
    createServerSupabaseClientMock: vi.fn(),
    fetchMock: vi.fn(),
    getSessionMock: vi.fn(),
    getUserMock: vi.fn(),
}));

vi.mock("@/lib/server-env", () => ({
    getBackendUrl: () => "http://backend.test",
}));
vi.mock("@/utils/supabase/server", () => ({
    createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { POST } from "./route";

describe("POST evidence upload presign", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        getSessionMock.mockResolvedValue({
            data: { session: { access_token: "access-token" } },
            error: null,
        });
        getUserMock.mockResolvedValue({
            data: { user: { id: "profile-id" } },
            error: null,
        });
        createServerSupabaseClientMock.mockResolvedValue({
            auth: {
                getSession: getSessionMock,
                getUser: getUserMock,
            },
        });
    });

    it("preserves insufficient-credit responses for the billing modal", async () => {
        fetchMock.mockResolvedValue(
            Response.json(
                { detail: "Insufficient credits for asset verification" },
                { status: 402 },
            ),
        );

        const response = await POST(
            new Request("http://localhost/api/evidence-uploads/presign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalFileName: "proof.pdf",
                    contentType: "application/pdf",
                    fileSizeBytes: 100,
                }),
            }),
            { params: Promise.resolve({ claimId: "claim-id" }) },
        );

        expect(response.status).toBe(402);
        await expect(response.json()).resolves.toEqual({
            code: "INSUFFICIENT_CREDITS",
            error: "Insufficient credits for asset verification",
        });
    });
});
