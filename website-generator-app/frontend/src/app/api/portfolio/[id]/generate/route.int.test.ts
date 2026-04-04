import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const {
    createServerSupabaseClientMock,
    enforceRateLimitMock,
    getBackendUrlOrNullMock,
    generateRateLimitMock,
} = vi.hoisted(() => ({
    createServerSupabaseClientMock: vi.fn(),
    enforceRateLimitMock: vi.fn(),
    getBackendUrlOrNullMock: vi.fn(),
    generateRateLimitMock: { limit: vi.fn() },
}));

vi.mock("@/utils/supabase/server", () => ({
    createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/rate-limit/enable-rate-limit", () => ({
    enforceRateLimit: enforceRateLimitMock,
}));

vi.mock("@/lib/rate-limit/ratelimit", () => ({
    generateRateLimit: generateRateLimitMock,
}));

vi.mock("@/lib/server-env", () => ({
    getBackendUrlOrNull: getBackendUrlOrNullMock,
}));

import { POST } from "./route";

const makeRequest = (body: Record<string, unknown>): Request =>
    new Request("http://localhost/api/portfolio/p-1/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

const makeContext = (id = "p-1"): { params: Promise<{ id: string }> } => ({
    params: Promise.resolve({ id }),
});

const mockAuthedSupabase = (options?: {
    userId?: string;
    token?: string;
    session?: { access_token: string } | null;
}) => {
    const userId = options?.userId ?? "user-1";
    const token = options?.token ?? "token-abc";
    const session =
        options && "session" in options
            ? options.session
            : { access_token: token };

    createServerSupabaseClientMock.mockResolvedValue({
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
            }),
            getSession: vi.fn().mockResolvedValue({
                data: { session },
            }),
        },
    });
};

describe("POST /api/portfolio/[id]/generate (integration)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns 401 when auth user is missing", async () => {
        createServerSupabaseClientMock.mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: null },
                    error: null,
                }),
                getSession: vi.fn(),
            },
        });

        const response = await POST(
            makeRequest({ templateId: "t-1", resume: { summary: "x" } }),
            makeContext(),
        );

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            error: "Unauthorized",
            stage: "auth_user",
        });
        expect(enforceRateLimitMock).not.toHaveBeenCalled();
    });

    it("returns 400 when resume or templateId is missing", async () => {
        const response = await POST(
            makeRequest({ templateId: "t-1" }),
            makeContext(),
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "Resume and templateId are required for portfolio generation",
            stage: "input_validation",
        });
        expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    });

    it("returns 401 when session is missing", async () => {
        mockAuthedSupabase({ session: null });

        const response = await POST(
            makeRequest({ templateId: "t-1", resume: { summary: "x" } }),
            makeContext(),
        );

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            error: "Session expired",
            stage: "auth_session",
        });
    });

    it("returns 429 with rate-limit stage and forwarded headers when blocked", async () => {
        mockAuthedSupabase({ token: "token-123" });

        enforceRateLimitMock.mockResolvedValue(
            NextResponse.json(
                { error: "Too many requests" },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "1",
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": "1700001111",
                    },
                },
            ),
        );

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const response = await POST(
            makeRequest({ templateId: "t-1", resume: { summary: "x" } }),
            makeContext(),
        );

        expect(enforceRateLimitMock).toHaveBeenCalledTimes(1);
        expect(enforceRateLimitMock).toHaveBeenCalledWith(
            generateRateLimitMock,
            "generate:user:user-1",
        );
        expect(response.status).toBe(429);
        expect(response.headers.get("X-RateLimit-Limit")).toBe("1");
        expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
        expect(response.headers.get("X-RateLimit-Reset")).toBe("1700001111");
        await expect(response.json()).resolves.toEqual({
            error: "Too many requests",
            stage: "rate_limit",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns 500 when BACKEND_URL is not configured", async () => {
        mockAuthedSupabase();
        enforceRateLimitMock.mockResolvedValue(null);
        getBackendUrlOrNullMock.mockReturnValue(null);

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const response = await POST(
            makeRequest({ templateId: "t-1", resume: { summary: "x" } }),
            makeContext(),
        );

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "BACKEND_URL not configured",
            stage: "backend_config",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns backend error message when backend responds non-OK with error string", async () => {
        mockAuthedSupabase();
        enforceRateLimitMock.mockResolvedValue(null);
        getBackendUrlOrNullMock.mockReturnValue("http://backend:8080");

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({ assets: [] }),
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 502,
                json: vi.fn().mockResolvedValue({ error: "Backend overloaded" }),
            });
        vi.stubGlobal("fetch", fetchMock);

        const response = await POST(
            makeRequest({ templateId: "t-1", resume: { summary: "x" } }),
            makeContext(),
        );

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
            error: "Backend overloaded",
            stage: "backend_error",
        });
    });

    it("uses fallback backend error message when backend error is empty", async () => {
        mockAuthedSupabase();
        enforceRateLimitMock.mockResolvedValue(null);
        getBackendUrlOrNullMock.mockReturnValue("http://backend:8080");

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({ assets: [] }),
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue({ error: "   " }),
            });
        vi.stubGlobal("fetch", fetchMock);

        const response = await POST(
            makeRequest({ templateId: "t-1", resume: { summary: "x" } }),
            makeContext(),
        );

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "Portfolio generation failed",
            stage: "backend_error",
        });
    });

    it("returns 202 and forwards payload to backend with token and assets", async () => {
        mockAuthedSupabase();
        enforceRateLimitMock.mockResolvedValue(null);
        getBackendUrlOrNullMock.mockReturnValue("http://backend:8080");

        const fetchMock = vi
            .fn()
            // asset fetch
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    assets: [{ id: "asset-1", type: "image" }],
                }),
            })
            // generate call
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({ jobId: "job-123" }),
            });
        vi.stubGlobal("fetch", fetchMock);

        const response = await POST(
            makeRequest({
                templateId: "template-1",
                resume: { summary: "Engineer" },
                customField: "keep-me",
            }),
            makeContext("portfolio-9"),
        );

        expect(response.status).toBe(202);
        await expect(response.json()).resolves.toEqual({ jobId: "job-123" });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            "http://backend:8080/api/v1/portfolio/portfolio-9",
            {
                method: "GET",
                headers: { Authorization: "Bearer token-abc" },
            },
        );

        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            "http://backend:8080/api/v1/portfolio/portfolio-9/generate",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    Authorization: "Bearer token-abc",
                    "Content-Type": "application/json",
                }),
            }),
        );

        const secondCall = fetchMock.mock.calls[1] as [string, RequestInit];
        const secondBody = JSON.parse(String(secondCall[1].body));
        expect(secondBody).toEqual({
            templateId: "template-1",
            resume: { summary: "Engineer" },
            customField: "keep-me",
            assets: [{ id: "asset-1", type: "image" }],
        });
    });

    it("continues with empty assets when asset prefetch throws", async () => {
        mockAuthedSupabase();
        enforceRateLimitMock.mockResolvedValue(null);
        getBackendUrlOrNullMock.mockReturnValue("http://backend:8080");

        const fetchMock = vi
            .fn()
            // asset fetch throws -> falls back to []
            .mockRejectedValueOnce(new Error("asset fetch failed"))
            // generate call still succeeds
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({ jobId: "job-asset-fallback" }),
            });
        vi.stubGlobal("fetch", fetchMock);

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        const response = await POST(
            makeRequest({ templateId: "template-1", resume: { summary: "x" } }),
            makeContext("portfolio-10"),
        );

        expect(response.status).toBe(202);
        await expect(response.json()).resolves.toEqual({
            jobId: "job-asset-fallback",
        });

        const secondCall = fetchMock.mock.calls[1] as [string, RequestInit];
        const secondBody = JSON.parse(String(secondCall[1].body));
        expect(secondBody.assets).toEqual([]);
        expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it("continues with empty assets when asset prefetch responds non-OK", async () => {
        mockAuthedSupabase();
        enforceRateLimitMock.mockResolvedValue(null);
        getBackendUrlOrNullMock.mockReturnValue("http://backend:8080");

        const fetchMock = vi
            .fn()
            // asset fetch non-OK -> returns []
            .mockResolvedValueOnce({
                ok: false,
                json: vi.fn().mockResolvedValue({}),
            })
            // generate call succeeds
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({ jobId: "job-non-ok-assets" }),
            });
        vi.stubGlobal("fetch", fetchMock);

        const response = await POST(
            makeRequest({ templateId: "template-1", resume: { summary: "x" } }),
            makeContext("portfolio-11"),
        );

        expect(response.status).toBe(202);
        await expect(response.json()).resolves.toEqual({
            jobId: "job-non-ok-assets",
        });

        const secondCall = fetchMock.mock.calls[1] as [string, RequestInit];
        const secondBody = JSON.parse(String(secondCall[1].body));
        expect(secondBody.assets).toEqual([]);
    });

    it("continues with empty assets when portfolio payload has no assets array", async () => {
        mockAuthedSupabase();
        enforceRateLimitMock.mockResolvedValue(null);
        getBackendUrlOrNullMock.mockReturnValue("http://backend:8080");

        const fetchMock = vi
            .fn()
            // asset fetch OK but missing `assets` key -> falls back via ?? []
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({}),
            })
            // generate call succeeds
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({ jobId: "job-assets-missing" }),
            });
        vi.stubGlobal("fetch", fetchMock);

        const response = await POST(
            makeRequest({ templateId: "template-1", resume: { summary: "x" } }),
            makeContext("portfolio-12"),
        );

        expect(response.status).toBe(202);
        await expect(response.json()).resolves.toEqual({
            jobId: "job-assets-missing",
        });

        const secondCall = fetchMock.mock.calls[1] as [string, RequestInit];
        const secondBody = JSON.parse(String(secondCall[1].body));
        expect(secondBody.assets).toEqual([]);
    });

    it("returns unexpected 500 when request JSON parsing throws", async () => {
        const badJsonRequest = new Request(
            "http://localhost/api/portfolio/p-1/generate",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{",
            },
        );

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const response = await POST(badJsonRequest, makeContext());

        expect(response.status).toBe(500);
        const payload = await response.json();
        expect(payload.stage).toBe("unexpected");
        expect(payload.error).toContain("Unexpected server error:");
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("returns unexpected 500 when a non-Error is thrown", async () => {
        const weirdRequest = {
            json: vi.fn().mockRejectedValue("bad_json_string"),
        } as unknown as Request;

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const response = await POST(weirdRequest, makeContext());

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "Unexpected server error: bad_json_string",
            stage: "unexpected",
        });
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });
});
