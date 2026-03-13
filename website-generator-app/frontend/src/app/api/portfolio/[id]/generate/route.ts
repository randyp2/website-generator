import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { generateRateLimit } from "@/lib/rate-limit/ratelimit";

import { getBackendUrlOrNull } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type GenerateRequestBody = {
    templateId?: string;
    resume?: unknown;
    [key: string]: unknown;
};

const jsonError = (
    status: number,
    error: string,
    stage: string,
    headers?: HeadersInit,
) =>
    NextResponse.json(
        { error, stage },
        headers ? { status, headers } : { status },
    );

const fetchPortfolioAssets = async (
    backendUrl: string,
    portfolioId: string,
    token: string,
): Promise<object[]> => {
    try {
        const portfolioRes = await fetch(
            `${backendUrl}/api/v1/portfolio/${portfolioId}`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            },
        );

        if (!portfolioRes.ok) return [];

        const portfolioData = await portfolioRes.json();
        return portfolioData?.assets ?? [];
    } catch (err) {
        console.warn("[generate] Failed to fetch portfolio assets:", err);
        return [];
    }
};

export const POST = async (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => {
    try {
        // --- Parse and validate inputs.
        const body = (await req.json()) as GenerateRequestBody;
        const { id: portfolioId } = await context.params;
        if (!body?.resume || !body?.templateId) {
            return jsonError(
                400,
                "Resume and templateId are required for portfolio generation",
                "input_validation",
            );
        }

        // --- Authenticate request.
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            return jsonError(401, "Unauthorized", "auth_user");
        }

        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            return jsonError(401, "Session expired", "auth_session");
        }

        // --- Enforce guardrails: rate limit and single-flight lock.
        const rateLimitKey = `generate:user:${user.id}`;
        const rateLimitResponse = await enforceRateLimit(
            generateRateLimit,
            rateLimitKey,
        );
        if (rateLimitResponse) {
            return jsonError(
                429,
                "Too many requests",
                "rate_limit",
                rateLimitResponse.headers,
            );
        }

        // --- Resolve backend target and build backend payload.
        const backendUrl = getBackendUrlOrNull();
        if (!backendUrl) {
            return jsonError(
                500,
                "BACKEND_URL not configured",
                "backend_config",
            );
        }

        const token = session.access_token;
        const assets = await fetchPortfolioAssets(
            backendUrl,
            portfolioId,
            token,
        );

        // --- Call Spring backend (returns jobId immediately).
        const res = await fetch(
            `${backendUrl}/api/v1/portfolio/${portfolioId}/generate`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...body, assets }),
            },
        );

        const data = await res.json();

        if (!res.ok) {
            const errorMessage =
                typeof data.error === "string" && data.error.trim().length > 0
                    ? data.error
                    : "Portfolio generation failed";
            return jsonError(res.status, errorMessage, "backend_error");
        }

        // Returns { jobId: "..." }
        return NextResponse.json(data, { status: 202 });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[generate] Portfolio generate request error:", errorMessage);
        return jsonError(
            500,
            `Unexpected server error: ${errorMessage}`,
            "unexpected",
        );
    }
};
