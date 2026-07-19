// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_FORM } from "@/app/onboarding/lib/onboarding-utils";
import {
    readOnboardingDraft,
    writeOnboardingDraft,
} from "@/app/onboarding/lib/onboarding-draft";

const { createClientMock, signOutMock } = vi.hoisted(() => ({
    createClientMock: vi.fn(),
    signOutMock: vi.fn(),
}));

vi.mock("@/utils/supabase/client", () => ({
    createClient: createClientMock,
}));

import {
    clearDeletedAccountSession,
    signoutClient,
} from "./logout-client";

describe("signoutClient", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.sessionStorage.clear();
        createClientMock.mockReturnValue({
            auth: { signOut: signOutMock },
        });
        signOutMock.mockResolvedValue({ error: null });
    });

    it("clears onboarding drafts after signing out", async () => {
        writeOnboardingDraft(window.sessionStorage, "user-1", {
            form: DEFAULT_FORM,
            step: 0,
        });

        await signoutClient();

        expect(signOutMock).toHaveBeenCalledOnce();
        expect(
            readOnboardingDraft(window.sessionStorage, "user-1"),
        ).toBeNull();
    });

    it("clears only the current browser session after account deletion", async () => {
        writeOnboardingDraft(window.sessionStorage, "user-1", {
            form: DEFAULT_FORM,
            step: 0,
        });

        await clearDeletedAccountSession();

        expect(signOutMock).toHaveBeenCalledWith({ scope: "local" });
        expect(
            readOnboardingDraft(window.sessionStorage, "user-1"),
        ).toBeNull();
    });
});
