// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useUserMock } = vi.hoisted(() => ({
    useUserMock: vi.fn(),
}));

vi.mock("next/link", () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock("@/context/UserContext", () => ({
    useUser: useUserMock,
}));

import AccountSettingsPage from "./page";

describe("AccountSettingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useUserMock.mockReturnValue({
            user: {
                id: "profile-1",
                username: "Test User",
                email: "authenticated@example.com",
                avatar: null,
            },
        });
    });

    afterEach(() => {
        cleanup();
    });

    it("shows the authenticated email and detected browser timezone", async () => {
        const detectedTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

        render(<AccountSettingsPage />);

        expect(
            screen.getByText("authenticated@example.com"),
        ).toBeInTheDocument();
        expect(await screen.findByText(detectedTimezone)).toBeInTheDocument();
    });
});
