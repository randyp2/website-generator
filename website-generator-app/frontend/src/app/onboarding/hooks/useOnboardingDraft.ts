"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
    clearOnboardingDraft,
    getOnboardingDraftSnapshot,
    readOnboardingDraft,
    writeOnboardingDraft,
    type OnboardingDraft,
} from "../lib/onboarding-draft";
import type { FormState } from "../types";

type UseOnboardingDraftReturn = {
    draft: OnboardingDraft | null;
    isDraftHydrated: boolean;
    saveDraft: (form: FormState, step: number) => void;
    clearDraft: () => void;
};

const EMPTY_DRAFT_SNAPSHOT = "portrn:onboarding-draft:empty";
const SERVER_DRAFT_SNAPSHOT = "portrn:onboarding-draft:server";
const subscribeToDraft = () => () => undefined;
const getServerDraftSnapshot = () => SERVER_DRAFT_SNAPSHOT;

/** Restores and maintains the current user's tab-scoped onboarding draft. */
export const useOnboardingDraft = (
    userId: string,
): UseOnboardingDraftReturn => {
    const getClientDraftSnapshot = useCallback(
        () =>
            getOnboardingDraftSnapshot(window.sessionStorage, userId) ??
            EMPTY_DRAFT_SNAPSHOT,
        [userId],
    );
    const serializedDraft = useSyncExternalStore(
        subscribeToDraft,
        getClientDraftSnapshot,
        getServerDraftSnapshot,
    );
    const isDraftHydrated = serializedDraft !== SERVER_DRAFT_SNAPSHOT;
    const draft = useMemo(
        () =>
            isDraftHydrated && serializedDraft !== EMPTY_DRAFT_SNAPSHOT
                ? readOnboardingDraft(window.sessionStorage, userId)
                : null,
        [isDraftHydrated, serializedDraft, userId],
    );

    const saveDraft = useCallback(
        (form: FormState, step: number): void => {
            writeOnboardingDraft(window.sessionStorage, userId, {
                form,
                step,
            });
        },
        [userId],
    );

    const clearDraft = useCallback((): void => {
        clearOnboardingDraft(window.sessionStorage, userId);
    }, [userId]);

    return {
        draft,
        isDraftHydrated,
        saveDraft,
        clearDraft,
    };
};
