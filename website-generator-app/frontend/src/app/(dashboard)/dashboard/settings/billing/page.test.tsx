// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { addToastMock, useProfileMeQueryMock } = vi.hoisted(() => ({
    addToastMock: vi.fn(),
    useProfileMeQueryMock: vi.fn(),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ addToast: addToastMock }),
}));

vi.mock("@/hooks/useProfileMeQuery", () => ({
    useProfileMeQuery: useProfileMeQueryMock,
}));

import BillingSettingsPage from "./page";

describe("BillingSettingsPage", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        useProfileMeQueryMock.mockReturnValue({ data: { billing: null } });
        fetchMock.mockRejectedValue(new Error("portal unavailable"));
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it.each(["Payment methods", "Preferences"])(
        "opens the Stripe billing portal from %s",
        async (shortcutLabel) => {
            const user = userEvent.setup();
            render(<BillingSettingsPage />);

            await user.click(
                screen.getByRole("button", { name: new RegExp(shortcutLabel) }),
            );

            await waitFor(() => {
                expect(fetchMock).toHaveBeenCalledWith(
                    "/api/billing/portal/session",
                    { method: "POST" },
                );
            });
        },
    );

    it("does not show the deferred usage limits shortcut", () => {
        render(<BillingSettingsPage />);

        expect(screen.queryByText("Usage limits")).not.toBeInTheDocument();
    });

    it("shows promotional access and its remaining allowances separately from credits", () => {
        useProfileMeQueryMock.mockReturnValue({
            data: {
                billing: {
                    activePromotionKey: "launch_access_2026",
                    creditBalance: 0,
                    portfolioGenerationAllowanceRemaining: 1,
                    portfolioRefinementAllowanceRemaining: 2,
                    assetVerificationAllowanceRemaining: 15,
                },
            },
        });

        render(<BillingSettingsPage />);

        expect(screen.getByText("Launch · Promotional access")).toBeVisible();
        expect(screen.getByText("0 credits")).toBeVisible();
        expect(screen.getByText("1 remaining")).toBeVisible();
        expect(screen.getByText("2 remaining")).toBeVisible();
        expect(screen.getByText("15 remaining")).toBeVisible();
    });
});
