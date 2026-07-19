import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, fetchBackendMock, getSessionMock } =
    vi.hoisted(() => ({
        createServerSupabaseClientMock: vi.fn(),
        fetchBackendMock: vi.fn(),
        getSessionMock: vi.fn(),
    }));

vi.mock("@/lib/api/backendFetch", () => ({
    fetchBackend: fetchBackendMock,
}));
vi.mock("@/utils/supabase/server", () => ({
    createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { PATCH } from "./route";

const portfolioId = "123e4567-e89b-42d3-a456-426614174000";
const context = { params: Promise.resolve({ id: portfolioId }) };

describe("PATCH /api/portfolio/[id]/update", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getSessionMock.mockResolvedValue({
            data: { session: { access_token: "access-token" } },
        });
        createServerSupabaseClientMock.mockResolvedValue({
            auth: { getSession: getSessionMock },
        });
    });

    it("uses the authenticated backend helper and maps client fields", async () => {
        fetchBackendMock.mockResolvedValue(
            Response.json({ id: portfolioId, lastStep: "upload" }),
        );

        const response = await PATCH(
            new Request(`http://localhost/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: "upload" }),
            }),
            context,
        );

        expect(fetchBackendMock).toHaveBeenCalledWith(
            `/api/v1/portfolio/${portfolioId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: "Bearer access-token",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: undefined,
                    lastStep: "upload",
                    templateId: undefined,
                    styleChatHistory: undefined,
                    refineChatHistory: undefined,
                    description: undefined,
                }),
            },
        );
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            success: true,
            data: { id: portfolioId, lastStep: "upload" },
        });
    });

    it.each([
        [{ error: "Forbidden" }, "Forbidden"],
        [{ message: "Request rejected" }, "Request rejected"],
        [{ detail: "Access denied" }, "Access denied"],
    ])("preserves backend error details from %o", async (payload, message) => {
        fetchBackendMock.mockResolvedValue(
            Response.json(payload, { status: 403 }),
        );

        const response = await PATCH(
            new Request(`http://localhost/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: "upload" }),
            }),
            context,
        );

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: message });
    });

    it("rejects requests without a Supabase session", async () => {
        getSessionMock.mockResolvedValue({ data: { session: null } });

        const response = await PATCH(
            new Request(`http://localhost/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: "upload" }),
            }),
            context,
        );

        expect(response.status).toBe(401);
        expect(fetchBackendMock).not.toHaveBeenCalled();
    });
});
