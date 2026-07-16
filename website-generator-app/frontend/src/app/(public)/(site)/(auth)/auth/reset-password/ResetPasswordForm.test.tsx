// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, updateUserMock } = vi.hoisted(() => ({
    createClientMock: vi.fn(),
    updateUserMock: vi.fn(),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock("@/utils/supabase/client", () => ({
    createClient: createClientMock,
}));

import { ResetPasswordForm } from "./ResetPasswordForm";

describe("ResetPasswordForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createClientMock.mockReturnValue({
            auth: {
                updateUser: updateUserMock,
            },
        });
        updateUserMock.mockResolvedValue({ error: null });
    });

    afterEach(() => {
        cleanup();
    });

    it("rejects mismatched passwords before calling Supabase", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordForm />);

        await user.type(screen.getByLabelText("New password"), "password123");
        await user.type(
            screen.getByLabelText("Confirm new password"),
            "different123",
        );
        await user.click(screen.getByRole("button", { name: "Update password" }));

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Passwords do not match.",
        );
        expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("updates the authenticated recovery user's password", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordForm />);

        await user.type(screen.getByLabelText("New password"), "password123");
        await user.type(
            screen.getByLabelText("Confirm new password"),
            "password123",
        );
        await user.click(screen.getByRole("button", { name: "Update password" }));

        await waitFor(() => {
            expect(updateUserMock).toHaveBeenCalledWith({
                password: "password123",
            });
        });
        expect(screen.getByText("Password updated")).toBeInTheDocument();
    });
});
