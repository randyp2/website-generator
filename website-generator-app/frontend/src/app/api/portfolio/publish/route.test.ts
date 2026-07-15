import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const { proxyBackendRequestMock } = vi.hoisted(() => ({
    proxyBackendRequestMock: vi.fn(),
}));

vi.mock("@/lib/api/backendProxy", () => ({
    proxyBackendRequest: proxyBackendRequestMock,
}));

import { POST } from "./route";

const makeRequest = (body: Record<string, unknown>): Request =>
    new Request("http://localhost/api/portfolio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

describe("POST /api/portfolio/publish", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("forwards the external verification identifier through the authenticated proxy", async () => {
        const backendResponse = NextResponse.json({ status: "publish" });
        proxyBackendRequestMock.mockResolvedValue(backendResponse);

        const response = await POST(makeRequest({
            sourceType: "EXTERNAL",
            externalUrl: "https://example.com",
            siteVerificationId: "123e4567-e89b-42d3-a456-426614174000",
            slug: "example",
            description: "Portfolio",
            ignored: "not-forwarded",
        }));

        expect(response).toBe(backendResponse);
        expect(proxyBackendRequestMock).toHaveBeenCalledOnce();
        const [path, options] = proxyBackendRequestMock.mock.calls[0] as [
            string,
            { method: string; request: Request; authenticated: boolean },
        ];
        expect(path).toBe("/api/v1/portfolio/publish");
        expect(options.method).toBe("POST");
        expect(options.authenticated).toBe(true);
        await expect(options.request.json()).resolves.toEqual({
            portfolioId: null,
            sourceType: "EXTERNAL",
            title: null,
            externalUrl: "https://example.com",
            siteVerificationId: "123e4567-e89b-42d3-a456-426614174000",
            slug: "example",
            description: "Portfolio",
        });
    });

    it("does not manufacture a verification identifier when omitted", async () => {
        proxyBackendRequestMock.mockResolvedValue(
            NextResponse.json({ error: "Verification required" }, { status: 422 }),
        );

        const response = await POST(makeRequest({
            sourceType: "EXTERNAL",
            externalUrl: "https://example.com",
        }));

        expect(response.status).toBe(422);
        const [, options] = proxyBackendRequestMock.mock.calls[0] as [
            string,
            { request: Request },
        ];
        await expect(options.request.json()).resolves.toMatchObject({
            siteVerificationId: null,
        });
    });
});
