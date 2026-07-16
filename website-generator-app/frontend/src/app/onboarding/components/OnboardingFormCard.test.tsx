// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_FORM } from "../lib/onboarding-utils";
import OnboardingFormCard from "./OnboardingFormCard";

describe("OnboardingFormCard", () => {
    afterEach(() => {
        cleanup();
    });

    it("restores the saved step and persists subsequent step changes", async () => {
        const user = userEvent.setup();
        const form = {
            ...DEFAULT_FORM,
            username: "alex-dev",
        };
        const onDraftChange = vi.fn();

        render(
            <OnboardingFormCard
                form={form}
                usernameState={{ status: "available", reason: null }}
                usernameHelper="Username is available."
                usernamePreview="alex-dev"
                siteHost="localhost:3000"
                initialStep={1}
                bioLength={0}
                submitError={null}
                isSubmitting={false}
                canSubmit
                onSubmit={vi.fn()}
                onFieldChange={() => vi.fn()}
                onUsernameChange={vi.fn()}
                onDraftChange={onDraftChange}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Background" }),
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(onDraftChange).toHaveBeenCalledWith(form, 1);
        });

        await user.click(screen.getByRole("button", { name: "Continue" }));

        expect(
            screen.getByRole("heading", { name: "Links & bio" }),
        ).toBeInTheDocument();
        await waitFor(() => {
            expect(onDraftChange).toHaveBeenCalledWith(form, 2);
        });
    });
});
