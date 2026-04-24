import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface ProfileMeResponse {
    username?: string | null;
    onboardingComplete?: boolean | null;
}

/**
 * Fetches the authenticated user's profile snapshot from the backend.
 * Returns null when the backend is unavailable or the response is non-OK.
 */
const fetchProfileMe = async (accessToken: string): Promise<ProfileMeResponse | null> => {
    try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as ProfileMeResponse;
    } catch {
        return null;
    }
};

/**
 * Resolves the user's first destination after login.
 * - No session: redirect home
 * - Missing onboarding/username: redirect to onboarding
 * - Otherwise: redirect to dashboard
 */
const PostLoginResolverPage = async () => {
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        redirect("/");
    }

    const profile = await fetchProfileMe(session.access_token);
    const hasUsername =
        typeof profile?.username === "string" && profile.username.trim().length > 0;
    const onboardingComplete = profile?.onboardingComplete === true;

    if (!onboardingComplete || !hasUsername) {
        redirect("/onboarding");
    }

    redirect("/dashboard-user");
};

export default PostLoginResolverPage;
