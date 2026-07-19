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

import { GET } from "./route";

const context = {
    params: Promise.resolve({
        id: "123e4567-e89b-42d3-a456-426614174000",
    }),
};

describe("GET /api/portfolio/[id]/versions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getSessionMock.mockResolvedValue({
            data: { session: { access_token: "access-token" } },
        });
        createServerSupabaseClientMock.mockResolvedValue({
            auth: { getSession: getSessionMock },
        });
    });

    it("uses the backend helper and maps a successful response", async () => {
        fetchBackendMock.mockResolvedValue(Response.json({
            versions: [
                {
                    id: "version-1",
                    createdAt: "2026-07-14T12:00:00Z",
                    assistantMessage: { content: "Generated" },
                    promptUsed: "Build a portfolio",
                    previewUrl: "https://example.com/preview",
                    active: true,
                    published: false,
                },
            ],
        }));

        const response = await GET(new Request("http://localhost"), context);

        expect(fetchBackendMock).toHaveBeenCalledWith(
            "/api/v1/portfolio/123e4567-e89b-42d3-a456-426614174000/versions",
            {
                method: "GET",
                headers: { Authorization: "Bearer access-token" },
            },
        );
        await expect(response.json()).resolves.toEqual({
            versions: [
                {
                    id: "version-1",
                    created_at: "2026-07-14T12:00:00Z",
                    assistant_message: { content: "Generated" },
                    prompt_used: "Build a portfolio",
                    preview_url: "https://example.com/preview",
                    is_active: true,
                    is_published: false,
                },
            ],
        });
    });

    it.each([
        [{ error: "Forbidden" }, "Forbidden"],
        [{ message: "Request rejected" }, "Request rejected"],
        [{ detail: "Access denied" }, "Access denied"],
    ])("preserves backend error details from %o", async (payload, message) => {
        fetchBackendMock.mockResolvedValue(Response.json(payload, { status: 403 }));

        const response = await GET(new Request("http://localhost"), context);

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: message });
    });

    it("rejects requests without a Supabase session", async () => {
        getSessionMock.mockResolvedValue({ data: { session: null } });

        const response = await GET(new Request("http://localhost"), context);

        expect(response.status).toBe(401);
        expect(fetchBackendMock).not.toHaveBeenCalled();
    });
});
