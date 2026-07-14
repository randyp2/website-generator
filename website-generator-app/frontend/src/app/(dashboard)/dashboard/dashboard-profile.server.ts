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

type ProfileFetchOutcome =
    | { ok: true; profile: ProfileMeResponse }
    // 404: the user has no profile yet → they belong in onboarding.
    | { ok: false; reason: "not-found" }
    // 401/403/5xx/network/parse: we couldn't get an answer. This is NOT a
    // statement that onboarding is unfinished, so it must not route to it.
    | { ok: false; reason: "failed" };

const fetchDashboardProfile = async (
    accessToken: string,
): Promise<ProfileFetchOutcome> => {
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        });

        if (response.ok) {
            return {
                ok: true,
                profile: (await response.json()) as ProfileMeResponse,
            };
        }

        return {
            ok: false,
            reason: response.status === 404 ? "not-found" : "failed",
        };
    } catch {
        return { ok: false, reason: "failed" };
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

        const outcome = await fetchDashboardProfile(session.access_token);

        if (!outcome.ok) {
            // No profile yet → send the user to onboarding to create one.
            if (outcome.reason === "not-found") {
                redirect("/onboarding");
            }
            // A genuine fetch/auth failure must NOT be treated as "onboarding
            // incomplete" — that redirects to /onboarding, which for a completed
            // user redirects straight back here (an infinite loop). Surface it
            // to the dashboard error boundary instead; Retry re-runs this after
            // the middleware has refreshed the session cookie.
            throw new Error("We couldn't load your profile.");
        }

        const profile = outcome.profile;
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
