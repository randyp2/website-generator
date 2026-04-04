import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * - Create supabase client that can read and write cookies
 * - Check for OAuth "code" in URL
 *    - If found, exchange it for session tokens
 * - If not, just validate existing session
 *
 *
 * @param request
 * @returns
 */
export const updateSession = async (request: NextRequest) => {
    // Let request continue normally
    const response = NextResponse.next({
        request: { headers: request.headers },
    });

    // Connect to supabase backend
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    // Read cookies from incoming request
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Save cookies onto response
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({ name, value: "", ...options });
                },
            },
        },
    );

    // Get the request URL
    const { searchParams } = new URL(request.url);
    // Search for "code" param (OAuth redirect)
    const code = searchParams.get("code");

    if (code) {
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

        // Default redirect
        const redirectResponse = NextResponse.redirect(nextUrl); // If we came from /dashboard, keep that path
        for (const cookie of response.cookies.getAll()) {
            redirectResponse.cookies.set(cookie);
        }

        return redirectResponse;
    }

    await supabase.auth.getUser();
    return response;
};
