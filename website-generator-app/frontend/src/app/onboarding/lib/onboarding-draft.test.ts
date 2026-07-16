// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_FORM } from "./onboarding-utils";
import {
    clearAllOnboardingDrafts,
    clearOnboardingDraft,
    readOnboardingDraft,
    writeOnboardingDraft,
} from "./onboarding-draft";

const USER_ID = "user-1";
const DRAFT_KEY = "portrn:onboarding-draft:user-1";
const draft = {
    form: {
        ...DEFAULT_FORM,
        username: "alex-dev",
        firstName: "Alex",
        bio: "Building useful things.",
    },
    step: 2,
};

describe("onboarding draft storage", () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it("round-trips a versioned draft without sharing it across users", () => {
        expect(
            writeOnboardingDraft(window.sessionStorage, USER_ID, draft),
        ).toBe(true);

        expect(readOnboardingDraft(window.sessionStorage, USER_ID)).toEqual(
            draft,
        );
        expect(
            readOnboardingDraft(window.sessionStorage, "different-user"),
        ).toBeNull();
    });

    it("removes malformed or incompatible drafts", () => {
        window.sessionStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ version: 999, form: draft.form, step: 2 }),
        );

        expect(readOnboardingDraft(window.sessionStorage, USER_ID)).toBeNull();
        expect(window.sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it("clears one user or every onboarding draft without touching other data", () => {
        writeOnboardingDraft(window.sessionStorage, USER_ID, draft);
        writeOnboardingDraft(window.sessionStorage, "user-2", draft);
        window.sessionStorage.setItem("unrelated", "keep-me");

        clearOnboardingDraft(window.sessionStorage, USER_ID);
        expect(readOnboardingDraft(window.sessionStorage, USER_ID)).toBeNull();
        expect(
            readOnboardingDraft(window.sessionStorage, "user-2"),
        ).toEqual(draft);

        clearAllOnboardingDrafts(window.sessionStorage);
        expect(
            readOnboardingDraft(window.sessionStorage, "user-2"),
        ).toBeNull();
        expect(window.sessionStorage.getItem("unrelated")).toBe("keep-me");
    });
});
