// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, resetPasswordForEmailMock } = vi.hoisted(() => ({
    createClientMock: vi.fn(),
    resetPasswordForEmailMock: vi.fn(),
}));

vi.mock("@/utils/supabase/client", () => ({
    createClient: createClientMock,
}));

vi.mock("@/components/auth/TurnstileCaptcha", () => ({
    TurnstileCaptcha: ({
        onTokenChange,
    }: {
        onTokenChange: (token: string) => void;
    }) => (
        <button
            type="button"
            onClick={() => onTokenChange("captcha-token")}
        >
            Complete security check
        </button>
    ),
}));

import { ForgotPasswordForm } from "./ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createClientMock.mockReturnValue({
            auth: {
                resetPasswordForEmail: resetPasswordForEmailMock,
            },
        });
        resetPasswordForEmailMock.mockResolvedValue({ error: null });
    });

    afterEach(() => {
        cleanup();
    });

    it("sends the email, reset redirect, and CAPTCHA token to Supabase", async () => {
        const user = userEvent.setup();
        render(
            <ForgotPasswordForm
                defaultEmail="person@example.com"
                onBack={vi.fn()}
            />,
        );

        expect(screen.getByLabelText("Email")).toHaveValue(
            "person@example.com",
        );
        await user.click(
            screen.getByRole("button", { name: "Complete security check" }),
        );
        await user.click(
            screen.getByRole("button", { name: "Send reset link" }),
        );

        await waitFor(() => {
            expect(resetPasswordForEmailMock).toHaveBeenCalledWith(
                "person@example.com",
                {
                    redirectTo:
                        "http://localhost:3000/auth/reset-password",
                    captchaToken: "captcha-token",
                },
            );
        });
        expect(screen.getByRole("status")).toHaveTextContent(
            "If an account exists for that email, a password reset link has been sent.",
        );
    });

    it("returns to login without sending a request", async () => {
        const user = userEvent.setup();
        const onBack = vi.fn();
        render(<ForgotPasswordForm onBack={onBack} />);

        await user.click(
            screen.getByRole("button", { name: "Back to login" }),
        );

        expect(onBack).toHaveBeenCalledOnce();
        expect(resetPasswordForEmailMock).not.toHaveBeenCalled();
    });
});
