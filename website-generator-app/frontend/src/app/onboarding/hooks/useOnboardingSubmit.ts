"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BIO_MAX_LENGTH, USERNAME_PATTERN } from "../constants";
import {
    hasCompletedOnboarding,
    parseJsonSafely,
    toPayload,
} from "../lib/onboarding-utils";
import {
    type FormState,
    type ProfileMeResponse,
    type ProfileUpdateErrorResponse,
    type UsernameState,
} from "../types";

type UseOnboardingSubmitParams = {
    form: FormState;
    username: string;
    usernameState: UsernameState;
    isBootstrapping: boolean;
};

type UseOnboardingSubmitReturn = {
    isSubmitting: boolean;
    submitError: string | null;
    clearSubmitError: () => void;
    canSubmit: boolean;
    submitProfile: () => Promise<void>;
};

export const useOnboardingSubmit = ({
    form,
    username,
    usernameState,
    isBootstrapping,
}: UseOnboardingSubmitParams): UseOnboardingSubmitReturn => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const canSubmit = useMemo(
        () => usernameState.status === "available" && !isSubmitting && !isBootstrapping,
        [isBootstrapping, isSubmitting, usernameState.status],
    );

    const clearSubmitError = (): void => {
        setSubmitError(null);
    };

    const submitProfile = async (): Promise<void> => {
        setSubmitError(null);

        if (!USERNAME_PATTERN.test(username)) {
            setSubmitError("Please enter a valid username.");
            return;
        }

        if (usernameState.status !== "available") {
            setSubmitError("Please choose an available username before continuing.");
            return;
        }

        if (form.bio.length > BIO_MAX_LENGTH) {
            setSubmitError("Bio must be 500 characters or less.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(toPayload(form)),
            });

            if (response.status === 401) {
                router.replace("/");
                return;
            }

            if (!response.ok) {
                const errorBody =
                    await parseJsonSafely<ProfileUpdateErrorResponse>(response);
                setSubmitError(
                    errorBody?.error ?? "We couldn't save your profile. Please try again.",
                );
                return;
            }

            const updated = await parseJsonSafely<ProfileMeResponse>(response);
            if (hasCompletedOnboarding(updated)) {
                router.replace("/dashboard-user");
                return;
            }

            setSubmitError("Profile saved, but onboarding is not complete yet.");
        } catch {
            setSubmitError("We couldn't save your profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        submitError,
        clearSubmitError,
        canSubmit,
        submitProfile,
    };
};
