import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { register } from "./instrumentation";

describe("server fetch instrumentation", () => {
    const originalBackendUrl = process.env.BACKEND_URL;
    const originalInternalSecret = process.env.INTERNAL_API_SECRET;
    const originalNextRuntime = process.env.NEXT_RUNTIME;
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
        process.env.BACKEND_URL = "http://backend.test";
        process.env.INTERNAL_API_SECRET = "internal-secret";
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        restoreEnvironmentVariable("BACKEND_URL", originalBackendUrl);
        restoreEnvironmentVariable(
            "INTERNAL_API_SECRET",
            originalInternalSecret,
        );
        restoreEnvironmentVariable("NEXT_RUNTIME", originalNextRuntime);
    });

    it("attaches the internal secret when the Node runtime is implicit", async () => {
        delete process.env.NEXT_RUNTIME;
        await register();

        await globalThis.fetch("http://backend.test/api/v1/profile/me", {
            headers: { Authorization: "Bearer access-token" },
        });

        expect(fetchMock).toHaveBeenCalledOnce();
        const [, init] = fetchMock.mock.calls[0];
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer access-token");
        expect(headers.get("X-Internal-Secret")).toBe("internal-secret");
    });

    it("preserves headers carried by a Request input", async () => {
        delete process.env.NEXT_RUNTIME;
        await register();

        await globalThis.fetch(
            new Request("http://backend.test/api/v1/profile/me", {
                headers: { Authorization: "Bearer access-token" },
            }),
        );

        const [, init] = fetchMock.mock.calls[0];
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer access-token");
        expect(headers.get("X-Internal-Secret")).toBe("internal-secret");
    });

    it("does not patch fetch in the Edge runtime", async () => {
        process.env.NEXT_RUNTIME = "edge";
        await register();

        await globalThis.fetch("http://backend.test/api/v1/profile/me");

        expect(fetchMock).toHaveBeenCalledWith(
            "http://backend.test/api/v1/profile/me",
        );
    });
});

const restoreEnvironmentVariable = (
    name: "BACKEND_URL" | "INTERNAL_API_SECRET" | "NEXT_RUNTIME",
    value: string | undefined,
): void => {
    if (value === undefined) {
        delete process.env[name];
        return;
    }

    process.env[name] = value;
};
