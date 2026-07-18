import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, uploadToSignedUrlMock } = vi.hoisted(() => ({
    createClientMock: vi.fn(),
    uploadToSignedUrlMock: vi.fn(),
}));

vi.mock("@/utils/supabase/client", () => ({
    createClient: createClientMock,
}));

import {
    finalizePortfolioUploads,
    uploadPortfolioFiles,
} from "./portfolioUploadClient";

describe("portfolioUploadClient", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        uploadToSignedUrlMock.mockResolvedValue({ data: {}, error: null });
        createClientMock.mockReturnValue({
            storage: {
                from: vi.fn(() => ({
                    uploadToSignedUrl: uploadToSignedUrlMock,
                })),
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("uploads file bytes directly with the returned Supabase token", async () => {
        fetchMock.mockResolvedValueOnce(Response.json({
            uploads: [{
                clientId: "image-0",
                kind: "image",
                bucket: "portfolio_uploads",
                path: "media/portfolio-id/work.png",
                token: "signed-token",
                contentType: "image/png",
            }],
        }));
        const file = new File([new Uint8Array([1, 2, 3])], "work.png", {
            type: "image/png",
        });

        const instructions = await uploadPortfolioFiles("portfolio-id", [{
            clientId: "image-0",
            kind: "image",
            upload: {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
            },
        }]);

        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock.mock.calls[0][0]).toBe(
            "/api/portfolio/portfolio-id/uploads/presign",
        );
        expect(uploadToSignedUrlMock).toHaveBeenCalledWith(
            "media/portfolio-id/work.png",
            "signed-token",
            file,
            { contentType: "image/png", upsert: false },
        );
        expect(instructions.get("image-0")?.bucket).toBe("portfolio_uploads");
    });

    it("sends only JSON storage references during finalization", async () => {
        fetchMock.mockResolvedValueOnce(Response.json({
            portfolio: { id: "portfolio-id" },
        }));
        const payload = {
            resumeRawFileBucket: null,
            resumeRawFilePath: null,
            assets: [],
            templateId: "template-id",
            lastStep: "review",
        };

        await expect(
            finalizePortfolioUploads("portfolio-id", payload),
        ).resolves.toEqual({ portfolio: { id: "portfolio-id" } });

        const request = fetchMock.mock.calls[0][1];
        expect(request?.headers).toEqual({ "Content-Type": "application/json" });
        expect(JSON.parse(String(request?.body))).toEqual(payload);
    });

    it("surfaces presign errors without attempting storage upload", async () => {
        fetchMock.mockResolvedValueOnce(Response.json(
            { error: "Selected file exceeds the allowed size" },
            { status: 400 },
        ));
        const file = new File(["content"], "large.mp4", { type: "video/mp4" });

        await expect(uploadPortfolioFiles("portfolio-id", [{
            clientId: "video-0",
            kind: "video",
            upload: {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
            },
        }])).rejects.toThrow("Selected file exceeds the allowed size");
        expect(uploadToSignedUrlMock).not.toHaveBeenCalled();
    });
});
