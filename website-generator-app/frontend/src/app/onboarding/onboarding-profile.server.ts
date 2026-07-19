import "server-only";

import { redirect } from "next/navigation";

import { fetchBackend } from "@/lib/api/backendFetch";
import { createServerSupabaseClient } from "@/utils/supabase/server";

import { hasCompletedOnboarding } from "./lib/onboarding-utils";
import type { ProfileMeResponse } from "./types";

/** Server-authenticated data required to initialize the onboarding client. */
export type OnboardingBootstrap = {
    initialProfile: ProfileMeResponse | null;
    userId: string;
};

const fetchOnboardingProfile = async (
    accessToken: string,
): Promise<ProfileMeResponse | null> => {
    try {
        const response = await fetchBackend("/api/v1/profile/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) return null;
        return (await response.json()) as ProfileMeResponse;
    } catch {
        return null;
    }
};

/** Resolves onboarding eligibility and user-scoped bootstrap data. */
export const getOnboardingBootstrap = async (): Promise<OnboardingBootstrap> => {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/");

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) redirect("/");

    const profile = await fetchOnboardingProfile(session.access_token);
    if (hasCompletedOnboarding(profile)) redirect("/dashboard");

    return {
        initialProfile: profile,
        userId: user.id,
    };
};
