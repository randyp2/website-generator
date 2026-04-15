import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const DASHBOARD_PATH = "/dashboard-user";
const VERIFICATION_TAB = "skill-verification";
const OAUTH_PROVIDER = "github";

type OAuthResult = "success" | "error";

const buildRedirectUrl = (
    req: Request,
    result: OAuthResult,
    reason?: string,
): URL => {
    const redirectUrl = new URL(DASHBOARD_PATH, req.url);
    redirectUrl.searchParams.set("verificationTab", VERIFICATION_TAB);
    redirectUrl.searchParams.set("oauth", result);
    redirectUrl.searchParams.set("provider", OAUTH_PROVIDER);

    if (reason) {
        redirectUrl.searchParams.set("reason", reason);
    }

    return redirectUrl;
};

const mapBackendErrorReason = (status: number): string => {
    if (status === 401) return "unauthorized";
    if (status === 409) return "state_invalid";
    if (status === 400) return "invalid_callback";
    return "callback_failed";
};

export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const providerError = requestUrl.searchParams.get("error");
        const code = requestUrl.searchParams.get("code");
        const state = requestUrl.searchParams.get("state");

        if (providerError) {
            return NextResponse.redirect(
                buildRedirectUrl(req, "error", "provider_denied"),
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                buildRedirectUrl(req, "error", "missing_params"),
            );
        }

        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            return NextResponse.redirect(
                buildRedirectUrl(req, "error", "unauthorized"),
            );
        }

        const backendUrl: string = getBackendUrl();
        const response: Response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/connections/${OAUTH_PROVIDER}/callback`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, state }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Backend OAuth callback failed:",
                response.status,
                errorText,
            );
            return NextResponse.redirect(
                buildRedirectUrl(req, "error", mapBackendErrorReason(response.status)),
            );
        }

        return NextResponse.redirect(buildRedirectUrl(req, "success"));
    } catch (error) {
        console.error("Error in GitHub OAuth callback route:", error);
        return NextResponse.redirect(
            buildRedirectUrl(req, "error", "callback_failed"),
        );
    }
};
