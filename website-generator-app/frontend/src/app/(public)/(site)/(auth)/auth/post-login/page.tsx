import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type PostLoginSearchParams = Record<string, string | string[] | undefined>;

interface ProfileMeResponse {
    username?: string | null;
    onboardingComplete?: boolean | null;
}

const ALLOWED_POST_LOGIN_PATH_PREFIXES: readonly string[] = [
    "/dashboard",
    "/pricing",
    "/explore",
];

const getSingleParam = (value: string | string[] | undefined): string | null => {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return null;
};

const resolveSafeNextPath = (candidate: string | null): string | null => {
    if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
        return null;
    }

    try {
        const parsed = new URL(candidate, "http://localhost");
        const pathname = parsed.pathname;

        const isAllowed = ALLOWED_POST_LOGIN_PATH_PREFIXES.some(
            (prefix) =>
                pathname === prefix || pathname.startsWith(`${prefix}/`),
        );

        if (!isAllowed) {
            return null;
        }

        return `${pathname}${parsed.search}`;
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
    const nextPath = resolveSafeNextPath(nextParam);

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
