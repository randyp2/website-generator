"use client";

import {
    useEffect,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";

import {
    DEFAULT_FORM,
    hasCompletedOnboarding,
    mapProfileToForm,
    parseJsonSafely,
} from "../lib/onboarding-utils";
import { type FormState, type ProfileMeResponse } from "../types";

type UseOnboardingBootstrapReturn = {
    form: FormState;
    setForm: Dispatch<SetStateAction<FormState>>;
    isBootstrapping: boolean;
    bootstrapError: string | null;
    retryBootstrap: () => void;
};

export const useOnboardingBootstrap = (): UseOnboardingBootstrapReturn => {
    const router = useRouter();
    const [form, setForm] = useState<FormState>(DEFAULT_FORM);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [bootstrapError, setBootstrapError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isActive = true;

        const bootstrap = async () => {
            setIsBootstrapping(true);
            setBootstrapError(null);

            try {
                const response = await fetch("/api/profile/me", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!isActive) return;

                if (response.status === 401) {
                    router.replace("/");
                    return;
                }

                if (!response.ok) {
                    setBootstrapError("We couldn't load your profile right now.");
                    setIsBootstrapping(false);
                    return;
                }

                const profile = await parseJsonSafely<ProfileMeResponse>(response);
                if (!profile) {
                    setBootstrapError("We couldn't parse your profile data.");
                    setIsBootstrapping(false);
                    return;
                }

                if (hasCompletedOnboarding(profile)) {
                    router.replace("/dashboard");
                    return;
                }

                setForm(mapProfileToForm(profile));
                setIsBootstrapping(false);
            } catch {
                if (!isActive) return;
                setBootstrapError("We couldn't load your profile right now.");
                setIsBootstrapping(false);
            }
        };

        void bootstrap();

        return () => {
            isActive = false;
        };
    }, [reloadKey, router]);

    const retryBootstrap = (): void => {
        setReloadKey((value) => value + 1);
    };

    return {
        form,
        setForm,
        isBootstrapping,
        bootstrapError,
        retryBootstrap,
    };
};
