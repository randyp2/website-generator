import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const { proxyBackendRequestMock } = vi.hoisted(() => ({
    proxyBackendRequestMock: vi.fn(),
}));

vi.mock("@/lib/api/backendProxy", () => ({
    proxyBackendRequest: proxyBackendRequestMock,
}));

import { POST } from "./route";

const makeRequest = (body: string): Request =>
    new Request("http://localhost/api/portfolio/site-verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

describe("POST /api/portfolio/site-verifications", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects malformed or missing externalUrl values", async () => {
        const malformedResponse = await POST(makeRequest("not-json"));
        const missingResponse = await POST(makeRequest("{}"));

        expect(malformedResponse.status).toBe(400);
        expect(missingResponse.status).toBe(400);
        await expect(missingResponse.json()).resolves.toEqual({
            error: "externalUrl is required",
        });
        expect(proxyBackendRequestMock).not.toHaveBeenCalled();
    });

    it("rejects URLs that exceed the persistence limit", async () => {
        const response = await POST(makeRequest(JSON.stringify({
            externalUrl: `https://example.com/${"a".repeat(2048)}`,
        })));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "externalUrl must be at most 2048 characters",
        });
        expect(proxyBackendRequestMock).not.toHaveBeenCalled();
    });

    it("forwards only the normalized URL through the authenticated proxy", async () => {
        const backendResponse = NextResponse.json({
            verificationId: "verification-1",
            status: "PENDING",
        });
        proxyBackendRequestMock.mockResolvedValue(backendResponse);

        const response = await POST(makeRequest(JSON.stringify({
            externalUrl: "  https://example.com  ",
            ignored: "not-forwarded",
        })));

        expect(response).toBe(backendResponse);
        expect(proxyBackendRequestMock).toHaveBeenCalledTimes(1);
        const [path, options] = proxyBackendRequestMock.mock.calls[0] as [
            string,
            { method: string; request: Request; authenticated: boolean },
        ];
        expect(path).toBe("/api/v1/portfolio/site-verifications");
        expect(options.method).toBe("POST");
        expect(options.authenticated).toBe(true);
        await expect(options.request.json()).resolves.toEqual({
            externalUrl: "https://example.com",
        });
    });

    it("preserves authentication and backend error responses", async () => {
        const unauthorized = NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
        proxyBackendRequestMock.mockResolvedValue(unauthorized);

        const response = await POST(makeRequest(JSON.stringify({
            externalUrl: "https://example.com",
        })));

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    });
});
