import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_OAUTH_CODE_EXCHANGE_PATHS = new Set<string>([
    "/",
    "/dashboard",
    "/auth/post-login",
]);

const shouldExchangeSupabaseOAuthCode = (pathname: string): boolean =>
    SUPABASE_OAUTH_CODE_EXCHANGE_PATHS.has(pathname);

/**
 * - Create supabase client that can read and write cookies
 * - Check for Supabase OAuth "code" in URL on allowed callback paths
 *    - If found, exchange it for session tokens
 * - If not, just validate existing session
 *
 *
 * @param request
 * @returns
 */
export const updateSession = async (request: NextRequest) => {
    // Mutable so the cookie writer can rebuild it with the refreshed request.
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    // Connect to supabase backend
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // When Supabase refreshes an expired token it writes the new
                    // cookies here. Apply them to BOTH the request (so the route
                    // handler in this same request reads the fresh token) and the
                    // response (so the browser persists it). Updating only the
                    // response would refresh the token for the *next* request
                    // while this one still forwards the stale, expired token to
                    // the backend, which rejects it with a 403.
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // Get the request URL
    const requestUrl = new URL(request.url);
    const { searchParams, pathname } = requestUrl;
    // Search for "code" param (OAuth redirect)
    const code = searchParams.get("code");

    if (code && shouldExchangeSupabaseOAuthCode(pathname)) {
        await supabase.auth.exchangeCodeForSession(code);

        const nextUrl = new URL(request.url);
        nextUrl.searchParams.delete("code"); // Remove the oauth code from URL

        const redirectTo = nextUrl.searchParams.get("redirect_to");
        if (redirectTo) {
            const redirectResponse = NextResponse.redirect(redirectTo);
            for (const cookie of response.cookies.getAll()) {
                redirectResponse.cookies.set(cookie);
            }
            return redirectResponse;
        }

        // Always route OAuth callbacks through the post-login resolver so it
        // can decide where the user belongs (handles cases where Supabase
        // redirects to "/" or "/dashboard" instead of the requested redirectTo).
        if (pathname !== "/auth/post-login") {
            nextUrl.pathname = "/auth/post-login";
        }

        const redirectResponse = NextResponse.redirect(nextUrl);
        for (const cookie of response.cookies.getAll()) {
            redirectResponse.cookies.set(cookie);
        }

        return redirectResponse;
    }

    await supabase.auth.getUser();
    return response;
};
