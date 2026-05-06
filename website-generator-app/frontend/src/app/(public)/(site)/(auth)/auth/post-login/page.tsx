import { AUTH_NEXT_PATH_COOKIE } from "@/lib/public-auth-intent-storage";
import { resolveSafeNextPath } from "@/lib/safe-next-path";
import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type PostLoginSearchParams = Record<string, string | string[] | undefined>;

interface ProfileMeResponse {
    username?: string | null;
    onboardingComplete?: boolean | null;
}

const getSingleParam = (value: string | string[] | undefined): string | null => {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return null;
};

const resolveNextPathFromRedirectTo = (
    redirectToCandidate: string | null,
): string | null => {
    if (!redirectToCandidate) {
        return null;
    }

    try {
        const parsed = new URL(redirectToCandidate, "http://localhost");
        const nestedNext = parsed.searchParams.get("next");

        const safeNestedNext = resolveSafeNextPath(nestedNext);
        if (safeNestedNext) {
            return safeNestedNext;
        }

        const fallbackPath = `${parsed.pathname}${parsed.search}`;
        return resolveSafeNextPath(fallbackPath);
    } catch {
        return null;
    }
};

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
const PostLoginResolverPage = async ({
    searchParams,
}: {
    searchParams?: Promise<PostLoginSearchParams>;
}) => {
    const resolvedSearchParams = (await searchParams) ?? {};
    const nextParam = getSingleParam(resolvedSearchParams.next);
    const redirectToParam = getSingleParam(resolvedSearchParams.redirect_to);
    const cookieStore = await cookies();
    const cookieNextPath = cookieStore.get(AUTH_NEXT_PATH_COOKIE)?.value ?? null;
    const nextPath =
        resolveSafeNextPath(nextParam) ??
        resolveNextPathFromRedirectTo(redirectToParam) ??
        resolveSafeNextPath(cookieNextPath);

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
        const onboardingPath = nextPath
            ? `/onboarding?next=${encodeURIComponent(nextPath)}`
            : "/onboarding";
        redirect(onboardingPath);
    }

    redirect(nextPath ?? "/dashboard");
};

export default PostLoginResolverPage;
