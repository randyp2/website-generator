import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const { proxyBackendRequestMock } = vi.hoisted(() => ({
    proxyBackendRequestMock: vi.fn(),
}));

vi.mock("@/lib/api/backendProxy", () => ({
    proxyBackendRequest: proxyBackendRequestMock,
}));

import { DELETE } from "./route";

const makeRequest = (body: string): Request =>
    new Request("http://localhost/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body,
    });

describe("DELETE /api/account", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects malformed or incorrect confirmations", async () => {
        const malformedResponse = await DELETE(makeRequest("not-json"));
        const incorrectResponse = await DELETE(
            makeRequest(JSON.stringify({ confirmation: "delete" })),
        );

        expect(malformedResponse.status).toBe(400);
        expect(incorrectResponse.status).toBe(400);
        await expect(incorrectResponse.json()).resolves.toEqual({
            error: "Type DELETE to confirm account deletion.",
        });
        expect(proxyBackendRequestMock).not.toHaveBeenCalled();
    });

    it("forwards only the exact confirmation through the authenticated proxy", async () => {
        const backendResponse = NextResponse.json({
            stage: "COMPLETED",
            accountDeleted: true,
        });
        proxyBackendRequestMock.mockResolvedValue(backendResponse);

        const response = await DELETE(
            makeRequest(
                JSON.stringify({
                    confirmation: "DELETE",
                    ignored: "not-forwarded",
                }),
            ),
        );

        expect(response).toBe(backendResponse);
        expect(proxyBackendRequestMock).toHaveBeenCalledOnce();
        const [path, options] = proxyBackendRequestMock.mock.calls[0] as [
            string,
            { method: string; request: Request; authenticated: boolean },
        ];
        expect(path).toBe("/api/v1/account");
        expect(options.method).toBe("DELETE");
        expect(options.authenticated).toBe(true);
        await expect(options.request.json()).resolves.toEqual({
            confirmation: "DELETE",
        });
    });
});
