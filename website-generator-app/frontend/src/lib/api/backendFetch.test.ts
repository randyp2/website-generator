import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getBackendUrlMock } = vi.hoisted(() => ({
    getBackendUrlMock: vi.fn(() => "http://backend.test"),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/server-env", () => ({
    getBackendUrl: getBackendUrlMock,
}));

import { fetchBackend } from "./backendFetch";

describe("fetchBackend", () => {
    const originalInternalSecret = process.env.INTERNAL_API_SECRET;
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
        process.env.INTERNAL_API_SECRET = "internal-secret";
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalInternalSecret === undefined) {
            delete process.env.INTERNAL_API_SECRET;
        } else {
            process.env.INTERNAL_API_SECRET = originalInternalSecret;
        }
    });

    it("adds the configured internal secret without replacing other headers", async () => {
        await fetchBackend("/api/v1/portfolio/list", {
            headers: { Authorization: "Bearer access-token" },
        });

        expect(fetchMock).toHaveBeenCalledOnce();
        const [url, init] = fetchMock.mock.calls[0];
        const headers = new Headers(init?.headers);
        expect(url).toBe("http://backend.test/api/v1/portfolio/list");
        expect(headers.get("Authorization")).toBe("Bearer access-token");
        expect(headers.get("X-Internal-Secret")).toBe("internal-secret");
    });

    it("omits the internal header when the secret is not configured", async () => {
        delete process.env.INTERNAL_API_SECRET;

        await fetchBackend("/api/v1/portfolio/list");

        const [, init] = fetchMock.mock.calls[0];
        expect(new Headers(init?.headers).has("X-Internal-Secret")).toBe(false);
    });

    it("rejects paths outside the configured backend origin", () => {
        expect(() => fetchBackend("https://other.test/path")).toThrow(
            "Backend path must start with '/'",
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
