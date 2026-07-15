// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePreviewScreenshot } from "./usePreviewScreenshot";

describe("usePreviewScreenshot", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("polls a queued capture until its preview is ready", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(Response.json({
                status: "QUEUED",
                previewUrl: null,
            }))
            .mockResolvedValueOnce(Response.json({
                status: "READY",
                previewUrl: "https://cdn.example/external.png",
            }));
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() => usePreviewScreenshot(
            "verification-1",
            "/api/external-preview",
            true,
            "Capture failed",
        ));

        await waitFor(() => expect(result.current.state).toBe("processing"));
        await waitFor(
            () => expect(result.current.state).toBe("ready"),
            { timeout: 2_500 },
        );

        expect(result.current.previewUrl).toBe("https://cdn.example/external.png");
        expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/external-preview", { method: "POST" });
        expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/external-preview", { method: "GET" });
    });

    it("exposes failed capture state and allows an explicit retry", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(Response.json({ status: "FAILED", previewUrl: null }))
            .mockResolvedValueOnce(Response.json({
                status: "READY",
                previewUrl: "https://cdn.example/retried.png",
            }));
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() => usePreviewScreenshot(
            "verification-1",
            "/api/external-preview",
            true,
            "Capture failed",
        ));

        await waitFor(() => expect(result.current.state).toBe("error"));
        act(() => result.current.retry());
        await waitFor(() => expect(result.current.state).toBe("ready"));

        expect(result.current.previewUrl).toBe("https://cdn.example/retried.png");
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
