"use client";

import {
    useEffect,
    useMemo,
    useCallback,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";

import {
    getProfileMeErrorStatus,
    useProfileMeQuery,
} from "@/hooks/useProfileMeQuery";
import {
    DEFAULT_FORM,
    hasCompletedOnboarding,
    mapProfileToForm,
} from "../lib/onboarding-utils";
import { type FormState } from "../types";
import type { ProfileMeResponse } from "../types";

type UseOnboardingBootstrapReturn = {
    form: FormState;
    setForm: Dispatch<SetStateAction<FormState>>;
    isBootstrapping: boolean;
    bootstrapError: string | null;
    retryBootstrap: () => void;
};

export const useOnboardingBootstrap = (
    initialProfile?: ProfileMeResponse,
    initialDraftForm?: FormState,
): UseOnboardingBootstrapReturn => {
    const router = useRouter();
    const [draftForm, setDraftForm] = useState<FormState | null>(null);
    const profileQuery = useProfileMeQuery({ initialData: initialProfile });
    const profile = profileQuery.data;
    const profileForm = useMemo(
        () =>
            profile && !hasCompletedOnboarding(profile)
                ? mapProfileToForm(profile)
                : null,
        [profile],
    );
    const form = draftForm ?? initialDraftForm ?? profileForm ?? DEFAULT_FORM;
    const setForm: Dispatch<SetStateAction<FormState>> = useCallback(
        (update) => {
            setDraftForm((current) => {
                const base = current ?? initialDraftForm ?? form;
                return typeof update === "function" ? update(base) : update;
            });
        },
        [form, initialDraftForm],
    );
    const bootstrapError = useMemo(() => {
        if (profileQuery.isPending) {
            return null;
        }

        if (profile) {
            return null;
        }

        if (profileQuery.error) {
            return getProfileMeErrorStatus(profileQuery.error) === 401
                ? null
                : "We couldn't load your profile right now.";
        }

        return "We couldn't parse your profile data.";
    }, [
        profile,
        profileQuery.error,
        profileQuery.isPending,
    ]);

    useEffect(() => {
        if (profileQuery.isPending) {
            return;
        }

        if (profileQuery.error) {
            if (getProfileMeErrorStatus(profileQuery.error) === 401) {
                router.replace("/");
                return;
            }

            return;
        }

        if (!profile) {
            return;
        }

        if (hasCompletedOnboarding(profile)) {
            router.replace("/dashboard");
            return;
        }
    }, [
        profile,
        profileQuery.error,
        profileQuery.isPending,
        router,
    ]);

    const retryBootstrap = (): void => {
        setDraftForm(null);
        void profileQuery.refetch();
    };

    return {
        form,
        setForm,
        isBootstrapping: profileQuery.isPending,
        bootstrapError,
        retryBootstrap,
    };
};
