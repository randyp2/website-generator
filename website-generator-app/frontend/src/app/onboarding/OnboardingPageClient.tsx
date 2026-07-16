"use client";

import {
    useCallback,
    useMemo,
    type ChangeEvent,
    type FormEvent,
} from "react";

import OnboardingErrorState from "./components/OnboardingErrorState";
import OnboardingFormCard from "./components/OnboardingFormCard";
import OnboardingLoadingState from "./components/OnboardingLoadingState";
import { useOnboardingBootstrap } from "./hooks/useOnboardingBootstrap";
import { useOnboardingDraft } from "./hooks/useOnboardingDraft";
import { useOnboardingSubmit } from "./hooks/useOnboardingSubmit";
import { useUsernameAvailability } from "./hooks/useUsernameAvailability";
import {
    getUsernameMessage,
    normalizeUsername,
} from "./lib/onboarding-utils";
import { type FormState } from "./types";
import type { ProfileMeResponse } from "./types";

interface OnboardingPageClientProps {
    initialProfile?: ProfileMeResponse;
    siteHost: string;
    userId: string;
}

const OnboardingPageClient = ({
    initialProfile,
    siteHost,
    userId,
}: OnboardingPageClientProps) => {
    const {
        draft,
        isDraftHydrated,
        saveDraft,
        clearDraft,
    } = useOnboardingDraft(userId);
    const {
        form,
        setForm,
        isBootstrapping,
        bootstrapError,
        retryBootstrap,
    } = useOnboardingBootstrap(initialProfile, draft?.form);

    const isPreparing = isBootstrapping || !isDraftHydrated;
    const usernameNormalized = useMemo(
        () => normalizeUsername(form.username),
        [form.username],
    );
    const usernameState = useUsernameAvailability({
        username: usernameNormalized,
        isBootstrapping: isPreparing,
    });
    const {
        isSubmitting,
        submitError,
        clearSubmitError,
        canSubmit,
        submitProfile,
    } = useOnboardingSubmit({
        form,
        username: usernameNormalized,
        usernameState,
        isBootstrapping: isPreparing,
        onComplete: clearDraft,
    });

    const bioLength = form.bio.length;
    const usernamePreview =
        usernameNormalized.length > 0 ? usernameNormalized : "your-name";
    const usernameHelper = getUsernameMessage(usernameState);

    const handleFieldChange = useCallback(
        (field: keyof FormState) =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const nextValue = event.target.value;
            setForm((previous) => ({
                ...previous,
                [field]: nextValue,
            }));
            clearSubmitError();
        },
        [clearSubmitError, setForm],
    );

    const handleUsernameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setForm((previous) => ({
                ...previous,
                username: event.target.value.toLowerCase(),
            }));
            clearSubmitError();
        },
        [clearSubmitError, setForm],
    );

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            await submitProfile();
        },
        [submitProfile],
    );

    if (isPreparing) {
        return <OnboardingLoadingState />;
    }

    if (bootstrapError) {
        return (
            <OnboardingErrorState
                message={bootstrapError}
                onRetry={retryBootstrap}
            />
        );
    }

    return (
        <OnboardingFormCard
            form={form}
            usernameState={usernameState}
            usernameHelper={usernameHelper}
            usernamePreview={usernamePreview}
            siteHost={siteHost}
            initialStep={draft?.step ?? 0}
            bioLength={bioLength}
            submitError={submitError}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            onFieldChange={handleFieldChange}
            onUsernameChange={handleUsernameChange}
            onDraftChange={saveDraft}
        />
    );
};

export default OnboardingPageClient;
