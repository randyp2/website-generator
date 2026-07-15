// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGeneratedPortfolioPreview } from "./useGeneratedPortfolioPreview";

describe("useGeneratedPortfolioPreview", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("requests a generated preview and exposes the completed image", async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json({
            versionId: "version-1",
            status: "READY",
            previewUrl: "https://cdn.example/version-1.png",
        }));
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() =>
            useGeneratedPortfolioPreview("portfolio-1", true),
        );

        await waitFor(() => expect(result.current.state).toBe("ready"));
        expect(result.current.previewUrl).toBe("https://cdn.example/version-1.png");
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/portfolio/portfolio-1/preview-screenshot",
            { method: "POST" },
        );
    });

    it("does not request a screenshot before the generated flow is enabled", () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const { result } = renderHook(() =>
            useGeneratedPortfolioPreview("portfolio-1", false),
        );

        expect(result.current.state).toBe("idle");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
