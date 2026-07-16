// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, resetPasswordForEmailMock, resetTurnstileMock } =
    vi.hoisted(() => ({
        createClientMock: vi.fn(),
        resetPasswordForEmailMock: vi.fn(),
        resetTurnstileMock: vi.fn(),
    }));

vi.mock("@/utils/supabase/client", () => ({
    createClient: createClientMock,
}));

vi.mock("@/context/UserContext", () => ({
    useUser: () => ({
        user: {
            id: "user-1",
            username: "Test User",
            email: "person@example.com",
            avatar: null,
        },
    }),
}));

vi.mock("@/components/ui/dialog", () => ({
    Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogContent: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    DialogDescription: ({ children }: { children: ReactNode }) => (
        <p>{children}</p>
    ),
    DialogFooter: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    DialogHeader: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: ReactNode }) => (
        <h2>{children}</h2>
    ),
    DialogTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/auth/TurnstileCaptcha", () => {
    const MockTurnstile = React.forwardRef(
        (
            {
                onTokenChange,
            }: {
                onTokenChange: (token: string | null) => void;
            },
            ref: React.ForwardedRef<{ reset: () => void }>,
        ) => {
            React.useImperativeHandle(ref, () => ({
                reset: resetTurnstileMock,
            }));

            return (
                <button
                    type="button"
                    onClick={() => onTokenChange("captcha-token")}
                >
                    Complete security check
                </button>
            );
        },
    );
    MockTurnstile.displayName = "MockTurnstile";

    return { TurnstileCaptcha: MockTurnstile };
});

import { PasswordResetRequest } from "./PasswordResetRequest";

describe("PasswordResetRequest", () => {
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

    it("sends the authenticated email, recovery URL, and CAPTCHA token", async () => {
        const user = userEvent.setup();
        render(<PasswordResetRequest />);

        await user.click(
            screen.getByRole("button", { name: "Complete security check" }),
        );
        await user.click(
            screen.getByRole("button", { name: "Send reset email" }),
        );

        await waitFor(() => {
            expect(resetPasswordForEmailMock).toHaveBeenCalledWith(
                "person@example.com",
                {
                    redirectTo: "http://localhost:3000/auth/reset-password",
                    captchaToken: "captcha-token",
                },
            );
        });
        expect(resetTurnstileMock).toHaveBeenCalledOnce();
        expect(
            screen.getByText("Check your inbox for the password reset link."),
        ).toBeInTheDocument();
    });
});
