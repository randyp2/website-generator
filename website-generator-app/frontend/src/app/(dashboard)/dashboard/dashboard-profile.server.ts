import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import type { DashboardAuthUserFallback } from "../components/dashboard-user";
import { getBackendUrl } from "@/lib/server-env";
import type { ProfileMeResponse } from "@/hooks/useProfileMeQuery";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export interface DashboardProfileState {
    authUser: DashboardAuthUserFallback;
    profile: ProfileMeResponse;
}

const nonEmptyString = (value: unknown): string | null => {
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const toAuthUserFallback = (user: User): DashboardAuthUserFallback => ({
    avatarUrl: nonEmptyString(user.user_metadata?.avatar_url),
    email: nonEmptyString(user.email),
    fullName:
        nonEmptyString(user.user_metadata?.full_name) ??
        nonEmptyString(user.user_metadata?.name),
    id: user.id,
});

const fetchDashboardProfile = async (
    accessToken: string,
): Promise<ProfileMeResponse | null> => {
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
            method: "GET",
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

export const getDashboardProfileState =
    async (): Promise<DashboardProfileState> => {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            redirect("/");
        }

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            redirect("/");
        }

        const profile = await fetchDashboardProfile(session.access_token);

        // A failed profile load must NOT be treated as "onboarding incomplete".
        // Doing so redirects to /onboarding, which for a completed user
        // redirects straight back here — an infinite loop. Surface it to the
        // dashboard error boundary instead; Retry re-runs this after the
        // middleware has refreshed the session cookie.
        if (!profile) {
            throw new Error("We couldn't load your profile.");
        }

        const hasUsername =
            typeof profile.username === "string" &&
            profile.username.trim().length > 0;
        const onboardingComplete = profile.onboardingComplete === true;

        // Only redirect once we've positively determined onboarding is unfinished.
        if (!onboardingComplete || !hasUsername) {
            redirect("/onboarding");
        }

        const authUser = toAuthUserFallback(user);

        return {
            authUser,
            profile: {
                ...profile,
                email: nonEmptyString(profile.email) ?? authUser.email,
            },
        };
    };
