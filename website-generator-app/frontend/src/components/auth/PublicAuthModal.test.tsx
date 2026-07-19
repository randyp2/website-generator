// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
    createClientMock,
    signInWithOAuthMock,
    signInWithPasswordMock,
    signUpMock,
} = vi.hoisted(() => ({
    createClientMock: vi.fn(),
    signInWithOAuthMock: vi.fn(),
    signInWithPasswordMock: vi.fn(),
    signUpMock: vi.fn(),
}));

vi.mock("@/utils/supabase/client", () => ({
    createClient: createClientMock,
}));

vi.mock("@/components/ui/dialog", () => ({
    Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
        open ? <div>{children}</div> : null,
    DialogContent: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    DialogDescription: ({ children }: { children: ReactNode }) => (
        <p>{children}</p>
    ),
    DialogHeader: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: ReactNode }) => (
        <h2>{children}</h2>
    ),
}));

vi.mock("@/components/auth/TermsAgreementCheckbox", () => ({
    TermsAgreementCheckbox: ({
        checked,
        onCheckedChange,
    }: {
        checked: boolean;
        onCheckedChange: (checked: boolean) => void;
    }) => (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
        >
            Agree to terms
        </button>
    ),
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

vi.mock("@/components/auth/ForgotPasswordForm", () => ({
    ForgotPasswordForm: ({
        defaultEmail,
        onBack,
    }: {
        defaultEmail?: string;
        onBack: () => void;
    }) => (
        <div>
            <p>Recovery email: {defaultEmail}</p>
            <button type="button" onClick={onBack}>
                Back to login
            </button>
        </div>
    ),
}));

import { PublicAuthModal } from "./PublicAuthModal";

describe("PublicAuthModal CAPTCHA integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createClientMock.mockReturnValue({
            auth: {
                signInWithOAuth: signInWithOAuthMock,
                signInWithPassword: signInWithPasswordMock,
                signUp: signUpMock,
            },
        });
        signInWithPasswordMock.mockResolvedValue({ error: null });
        signUpMock.mockResolvedValue({ data: { session: null }, error: null });
    });

    afterEach(() => {
        cleanup();
    });

    it("passes a CAPTCHA token to password login", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(
            <PublicAuthModal
                open
                reason="general"
                intent={null}
                onOpenChange={onOpenChange}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Log in" }));
        await user.type(screen.getByLabelText("Email"), "person@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(
            screen.getByRole("button", { name: "Complete security check" }),
        );
        const loginButtons = screen.getAllByRole("button", { name: "Log in" });
        await user.click(loginButtons[loginButtons.length - 1]);

        await waitFor(() => {
            expect(signInWithPasswordMock).toHaveBeenCalledWith({
                email: "person@example.com",
                password: "password123",
                options: { captchaToken: "captcha-token" },
            });
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("passes a CAPTCHA token to email signup", async () => {
        const user = userEvent.setup();
        render(
            <PublicAuthModal
                open
                reason="general"
                intent={null}
                onOpenChange={vi.fn()}
            />,
        );

        await user.type(screen.getByLabelText("First name"), "Ava");
        await user.type(screen.getByLabelText("Last name"), "Johnson");
        await user.type(screen.getByLabelText("Email"), "ava@example.com");
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("checkbox"));
        await user.click(
            screen.getByRole("button", { name: "Complete security check" }),
        );
        await user.click(
            screen.getByRole("button", { name: "Create free account" }),
        );

        await waitFor(() => {
            expect(signUpMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: "ava@example.com",
                    password: "password123",
                    options: expect.objectContaining({
                        captchaToken: "captcha-token",
                    }),
                }),
            );
        });
    });

    it("opens recovery with the email entered in login mode", async () => {
        const user = userEvent.setup();
        render(
            <PublicAuthModal
                open
                reason="general"
                intent={null}
                onOpenChange={vi.fn()}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Log in" }));
        await user.type(screen.getByLabelText("Email"), "person@example.com");
        await user.click(
            screen.getByRole("button", { name: "Forgot password?" }),
        );

        expect(
            screen.getByRole("heading", { name: "Reset your password" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Recovery email: person@example.com"),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Continue with Google" }),
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Back to login" }),
        );
        expect(screen.getByLabelText("Email")).toHaveValue(
            "person@example.com",
        );
    });
});
