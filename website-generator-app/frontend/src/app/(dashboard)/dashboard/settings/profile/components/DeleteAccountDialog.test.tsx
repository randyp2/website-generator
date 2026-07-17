// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
    addToastMock,
    clearDeletedAccountSessionMock,
    fetchMock,
    refreshMock,
    replaceMock,
} = vi.hoisted(() => ({
    addToastMock: vi.fn(),
    clearDeletedAccountSessionMock: vi.fn(),
    fetchMock: vi.fn(),
    refreshMock: vi.fn(),
    replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        refresh: refreshMock,
        replace: replaceMock,
    }),
}));

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ addToast: addToastMock }),
}));

vi.mock("@/lib/logout-client", () => ({
    clearDeletedAccountSession: clearDeletedAccountSessionMock,
}));

import { DeleteAccountDialog } from "./DeleteAccountDialog";

describe("DeleteAccountDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        clearDeletedAccountSessionMock.mockResolvedValue(undefined);
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it("requires the exact confirmation before deleting the account", async () => {
        const user = userEvent.setup();
        render(<DeleteAccountDialog />);

        await user.click(
            screen.getByRole("button", { name: "Delete account" }),
        );

        const deleteForeverButton = screen.getByRole("button", {
            name: "Delete forever",
        });
        const confirmationInput = screen.getByLabelText(/Type DELETE to confirm/);

        expect(deleteForeverButton).toBeDisabled();
        await user.type(confirmationInput, "delete");
        expect(deleteForeverButton).toBeDisabled();
        await user.clear(confirmationInput);
        await user.type(confirmationInput, "DELETE");
        expect(deleteForeverButton).toBeEnabled();
    });

    it("clears the local session and returns home after completed deletion", async () => {
        fetchMock.mockResolvedValue(
            Response.json({ stage: "COMPLETED", accountDeleted: true }),
        );
        const user = userEvent.setup();
        render(<DeleteAccountDialog />);

        await user.click(
            screen.getByRole("button", { name: "Delete account" }),
        );
        await user.type(
            screen.getByLabelText(/Type DELETE to confirm/),
            "DELETE",
        );
        await user.click(
            screen.getByRole("button", { name: "Delete forever" }),
        );

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith("/api/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmation: "DELETE" }),
            });
        });
        expect(clearDeletedAccountSessionMock).toHaveBeenCalledOnce();
        expect(replaceMock).toHaveBeenCalledWith("/");
        expect(refreshMock).toHaveBeenCalledOnce();
    });

    it("keeps the session and reports backend failures", async () => {
        fetchMock.mockResolvedValue(
            Response.json(
                { detail: "Storage cleanup failed" },
                { status: 502 },
            ),
        );
        const user = userEvent.setup();
        render(<DeleteAccountDialog />);

        await user.click(
            screen.getByRole("button", { name: "Delete account" }),
        );
        await user.type(
            screen.getByLabelText(/Type DELETE to confirm/),
            "DELETE",
        );
        await user.click(
            screen.getByRole("button", { name: "Delete forever" }),
        );

        await waitFor(() => {
            expect(addToastMock).toHaveBeenCalledWith({
                type: "error",
                title: "Account deletion failed",
                description: "Storage cleanup failed",
            });
        });
        expect(clearDeletedAccountSessionMock).not.toHaveBeenCalled();
        expect(replaceMock).not.toHaveBeenCalled();
        expect(
            screen.getByRole("button", { name: "Delete forever" }),
        ).toBeEnabled();
    });
});
