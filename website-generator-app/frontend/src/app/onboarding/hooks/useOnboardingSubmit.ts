"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
    getProfileMeErrorStatus,
    useUpdateProfileMeMutation,
} from "@/hooks/useProfileMeQuery";
import { resolveSafeNextPath } from "@/lib/safe-next-path";
import {
    isLaunchPromotion,
    markLaunchWelcomePending,
} from "@/lib/billing/launch-promotion";
import { BIO_MAX_LENGTH, USERNAME_PATTERN } from "../constants";
import {
    hasCompletedOnboarding,
    toPayload,
} from "../lib/onboarding-utils";
import {
    type FormState,
    type UsernameState,
} from "../types";

type UseOnboardingSubmitParams = {
    form: FormState;
    username: string;
    usernameState: UsernameState;
    isBootstrapping: boolean;
    onComplete: () => void;
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
    onComplete,
}: UseOnboardingSubmitParams): UseOnboardingSubmitReturn => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const updateProfileMutation = useUpdateProfileMeMutation();
    const isSubmitting = updateProfileMutation.isPending;

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

        try {
            const updated = await updateProfileMutation.mutateAsync(toPayload(form));
            if (hasCompletedOnboarding(updated)) {
                if (isLaunchPromotion(updated.billing?.activePromotionKey)) {
                    markLaunchWelcomePending();
                }
                onComplete();
                const nextPath = resolveSafeNextPath(searchParams.get("next"));
                router.replace(nextPath ?? "/dashboard");
                return;
            }

            setSubmitError("Profile saved, but onboarding is not complete yet.");
        } catch (error) {
            if (getProfileMeErrorStatus(error) === 401) {
                router.replace("/");
                return;
            }

            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "We couldn't save your profile. Please try again.",
            );
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
