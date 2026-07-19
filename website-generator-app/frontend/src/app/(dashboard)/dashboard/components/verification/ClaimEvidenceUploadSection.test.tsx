// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { closeModalMock, pushMock } = vi.hoisted(() => ({
    closeModalMock: vi.fn(),
    pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));
vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock("./useClaimEvidenceUpload", () => ({
    useClaimEvidenceUpload: () => ({
        isTransferring: false,
        deletingUploadId: null,
        isInsufficientCreditsModalOpen: true,
        closeInsufficientCreditsModal: closeModalMock,
        upload: vi.fn(),
        deleteUpload: vi.fn(),
    }),
}));
vi.mock("./useClaimUploads", () => ({
    useClaimUploads: () => ({
        uploads: [],
        refetch: vi.fn(),
        removeUpload: vi.fn(),
        restoreUpload: vi.fn(),
    }),
}));

import ClaimEvidenceUploadSection from "./ClaimEvidenceUploadSection";

describe("ClaimEvidenceUploadSection", () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it("shows the shared billing modal and routes its action to pricing", () => {
        render(<ClaimEvidenceUploadSection claimId="claim-id" />);

        expect(screen.getByText("Insufficient credits")).toBeInTheDocument();
        expect(
            screen.getByText(/asset verification allowance or at least 1 credit/i),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Add credits" }));

        expect(closeModalMock).toHaveBeenCalledOnce();
        expect(pushMock).toHaveBeenCalledWith("/pricing");
    });
});
