import "server-only";

import { redirect } from "next/navigation";

import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";

import { hasCompletedOnboarding } from "./lib/onboarding-utils";
import type { ProfileMeResponse } from "./types";

const fetchOnboardingProfile = async (
    accessToken: string,
): Promise<ProfileMeResponse | null> => {
    try {
        const response = await fetch(`${getBackendUrl()}/api/v1/profile/me`, {
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

/** Resolves onboarding eligibility before the route renders any client UI. */
export const getOnboardingProfile = async (): Promise<ProfileMeResponse | null> => {
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

    return profile;
};
