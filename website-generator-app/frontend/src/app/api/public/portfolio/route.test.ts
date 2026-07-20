import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { fetchMock } = vi.hoisted(() => ({
    fetchMock: vi.fn(),
}));

vi.mock("@/lib/server-env", () => ({
    getBackendUrl: () => "https://api.portrn.test",
}));

import { GET } from "./route";

describe("GET /api/public/portfolio", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        vi.spyOn(console, "info").mockImplementation(() => undefined);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("requests the configured Spring backend", async () => {
        fetchMock.mockResolvedValue(
            Response.json({ content: [], totalPages: 0, last: true }),
        );

        const response = await GET(
            new NextRequest(
                "http://localhost/api/public/portfolio?page=2&size=6",
            ),
        );

        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledWith(
            new URL(
                "https://api.portrn.test/api/v1/public/portfolio?page=2&size=6",
            ),
            { next: { revalidate: 5 } },
        );
    });

    it("logs network failures and returns a stable error response", async () => {
        const cause = Object.assign(new Error("Name or service not known"), {
            code: "ENOTFOUND",
            hostname: "api.portrn.test",
            syscall: "getaddrinfo",
        });
        fetchMock.mockRejectedValue(
            new Error("fetch failed", { cause }),
        );

        const response = await GET(
            new NextRequest("http://localhost/api/public/portfolio"),
        );

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            content: [],
            totalPages: 0,
            last: true,
        });
        expect(console.error).toHaveBeenCalledWith(
            "[api/public/portfolio] Spring backend request failed",
            expect.objectContaining({
                backendOrigin: "https://api.portrn.test",
                error: expect.objectContaining({
                    message: "fetch failed",
                    cause: expect.objectContaining({
                        code: "ENOTFOUND",
                        hostname: "api.portrn.test",
                    }),
                }),
            }),
        );
    });
});
