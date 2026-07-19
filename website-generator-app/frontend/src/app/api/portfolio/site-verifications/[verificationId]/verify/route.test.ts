import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const { proxyBackendRequestMock } = vi.hoisted(() => ({
    proxyBackendRequestMock: vi.fn(),
}));

vi.mock("@/lib/api/backendProxy", () => ({
    proxyBackendRequest: proxyBackendRequestMock,
}));

import { POST } from "./route";

const request = new Request(
    "http://localhost/api/portfolio/site-verifications/id/verify",
    { method: "POST" },
);

const context = (verificationId: string) => ({
    params: Promise.resolve({ verificationId }),
});

describe("POST /api/portfolio/site-verifications/[verificationId]/verify", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects malformed verification IDs", async () => {
        const response = await POST(request, context("not-a-uuid"));

        expect(response.status).toBe(400);
        expect(proxyBackendRequestMock).not.toHaveBeenCalled();
    });

    it("forwards authenticated verification checks", async () => {
        const verificationId = "123e4567-e89b-42d3-a456-426614174000";
        const backendResponse = NextResponse.json({ status: "VERIFIED" });
        proxyBackendRequestMock.mockResolvedValue(backendResponse);

        const response = await POST(request, context(verificationId));

        expect(response).toBe(backendResponse);
        expect(proxyBackendRequestMock).toHaveBeenCalledWith(
            `/api/v1/portfolio/site-verifications/${verificationId}/verify`,
            {
                method: "POST",
                authenticated: true,
            },
        );
    });
});
