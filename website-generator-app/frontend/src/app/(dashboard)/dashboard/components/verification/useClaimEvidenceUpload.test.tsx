// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useClaimEvidenceUpload } from "./useClaimEvidenceUpload";

const fetchMock = vi.fn();

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    const ClaimEvidenceUploadTestProvider = ({
        children,
    }: {
        children: ReactNode;
    }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return ClaimEvidenceUploadTestProvider;
};

describe("useClaimEvidenceUpload", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
    });

    it("opens billing modal state when presign returns insufficient credits", async () => {
        fetchMock.mockResolvedValue(
            Response.json(
                {
                    code: "INSUFFICIENT_CREDITS",
                    error: "Insufficient credits for asset verification",
                },
                { status: 402 },
            ),
        );
        const { result } = renderHook(() => useClaimEvidenceUpload(), {
            wrapper: createWrapper(),
        });
        let uploadResult: Awaited<ReturnType<typeof result.current.upload>>;

        await act(async () => {
            uploadResult = await result.current.upload(
                "claim-id",
                new File(["proof"], "proof.pdf", {
                    type: "application/pdf",
                }),
            );
        });

        expect(uploadResult!).toBeNull();
        expect(result.current.isInsufficientCreditsModalOpen).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        act(() => result.current.closeInsufficientCreditsModal());
        expect(result.current.isInsufficientCreditsModalOpen).toBe(false);
    });

    it("opens billing modal state when atomic reservation fails at finalization", async () => {
        fetchMock
            .mockResolvedValueOnce(
                Response.json({
                    uploadId: "upload-id",
                    uploadUrl: "https://storage.test/upload",
                    requiredHeaders: null,
                }),
            )
            .mockResolvedValueOnce(new Response(null, { status: 200 }))
            .mockResolvedValueOnce(
                Response.json(
                    {
                        code: "INSUFFICIENT_CREDITS",
                        error: "Insufficient credits for asset verification",
                    },
                    { status: 402 },
                ),
            );
        const { result } = renderHook(() => useClaimEvidenceUpload(), {
            wrapper: createWrapper(),
        });
        let uploadResult: Awaited<ReturnType<typeof result.current.upload>>;

        await act(async () => {
            uploadResult = await result.current.upload(
                "claim-id",
                new File(["proof"], "proof.pdf", {
                    type: "application/pdf",
                }),
            );
        });

        expect(uploadResult!).toBeNull();
        expect(result.current.isInsufficientCreditsModalOpen).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });
});
