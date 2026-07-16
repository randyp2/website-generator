// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({
    useTheme: () => ({
        resolvedTheme: "light",
        setTheme: vi.fn(),
    }),
}));

vi.mock("@/components/branding/BrandWordmark", () => ({
    default: () => <span>Portrn</span>,
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

vi.mock("@/components/auth/TurnstileCaptcha", () => ({
    TurnstileCaptcha: () => <div>Security check</div>,
}));

vi.mock("@/lib/auth-actions", () => ({
    login: vi.fn(),
    signup: vi.fn(),
    signInWithGoogle: vi.fn(),
}));

import LandingAuthPanel from "./LandingAuthPanel";

describe("LandingAuthPanel password recovery", () => {
    afterEach(() => {
        cleanup();
    });

    it("opens recovery with the login email and preserves it on return", async () => {
        const user = userEvent.setup();
        render(<LandingAuthPanel />);

        await user.type(
            screen.getByPlaceholderText("you@example.com"),
            "person@example.com",
        );
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
        expect(screen.getByPlaceholderText("you@example.com")).toHaveValue(
            "person@example.com",
        );
    });
});
