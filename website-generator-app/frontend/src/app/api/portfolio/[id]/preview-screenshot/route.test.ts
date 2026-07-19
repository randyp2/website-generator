import { beforeEach, describe, expect, it, vi } from "vitest";

const { proxyBackendRequestMock } = vi.hoisted(() => ({
    proxyBackendRequestMock: vi.fn(),
}));

vi.mock("@/lib/api/backendProxy", () => ({
    proxyBackendRequest: proxyBackendRequestMock,
}));

import { GET, POST } from "./route";

const context = {
    params: Promise.resolve({ id: "portfolio-123" }),
};

describe("generated portfolio preview screenshot proxy", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        proxyBackendRequestMock.mockResolvedValue(Response.json({ status: "READY" }));
    });

    it("proxies authenticated screenshot requests", async () => {
        await POST(new Request("http://localhost"), context);

        expect(proxyBackendRequestMock).toHaveBeenCalledWith(
            "/api/v1/portfolio/portfolio-123/preview-screenshot",
            { method: "POST", authenticated: true },
        );
    });

    it("proxies authenticated screenshot status checks", async () => {
        await GET(new Request("http://localhost"), context);

        expect(proxyBackendRequestMock).toHaveBeenCalledWith(
            "/api/v1/portfolio/portfolio-123/preview-screenshot",
            { method: "GET", authenticated: true },
        );
    });
});
