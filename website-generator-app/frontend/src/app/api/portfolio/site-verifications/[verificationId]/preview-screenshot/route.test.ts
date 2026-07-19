import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const { proxyBackendRequestMock } = vi.hoisted(() => ({
    proxyBackendRequestMock: vi.fn(),
}));

vi.mock("@/lib/api/backendProxy", () => ({
    proxyBackendRequest: proxyBackendRequestMock,
}));

import { GET, POST } from "./route";

const verificationId = "123e4567-e89b-42d3-a456-426614174000";
const context = (id: string) => ({ params: Promise.resolve({ verificationId: id }) });
const request = new Request("http://localhost", { method: "POST" });

describe("external portfolio preview screenshot proxy", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        proxyBackendRequestMock.mockResolvedValue(NextResponse.json({ status: "READY" }));
    });

    it("rejects malformed verification IDs", async () => {
        const response = await POST(request, context("not-a-uuid"));

        expect(response.status).toBe(400);
        expect(proxyBackendRequestMock).not.toHaveBeenCalled();
    });

    it("proxies authenticated screenshot requests", async () => {
        await POST(request, context(verificationId));

        expect(proxyBackendRequestMock).toHaveBeenCalledWith(
            `/api/v1/portfolio/site-verifications/${verificationId}/preview-screenshot`,
            { method: "POST", authenticated: true },
        );
    });

    it("proxies authenticated screenshot status checks", async () => {
        await GET(request, context(verificationId));

        expect(proxyBackendRequestMock).toHaveBeenCalledWith(
            `/api/v1/portfolio/site-verifications/${verificationId}/preview-screenshot`,
            { method: "GET", authenticated: true },
        );
    });
});
