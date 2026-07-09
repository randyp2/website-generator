import { NextResponse } from "next/server";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { generateRateLimit } from "@/lib/rate-limit/ratelimit";
import { acquireLock, releaseLock } from "@/lib/rate-limit/redis-lock";
import { getBackendUrlOrNull } from "@/lib/server-env";

/**
 * POST /api/portfolio/[id]/refine/build
 *
 * Thin proxy that forwards the build request to the Java backend.
 * Only plans and the session id are forwarded: the backend loads section
 * code from its DB, so the client never supplies reactSource. The backend
 * handles all persistence asynchronously via RabbitMQ workers, so this
 * route just returns the { jobId } for client-side polling.
 */
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const body = await req.json();
    const { sectionPlans, sessionId } = body ?? {};
    const { id: portfolioId } = await context.params;

    if (!portfolioId) {
        return NextResponse.json(
            { error: "portfolioId is required" },
            { status: 400 },
        );
    }

    if (!sectionPlans || !Array.isArray(sectionPlans)) {
        return NextResponse.json(
            { error: "sectionPlans are required" },
            { status: 400 },
        );
    }

    const supabase = await createServerSupabaseClient();

    // Verify user authenticity with Supabase Auth server
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session for the access token (needed for backend call)
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const backendUrl = getBackendUrlOrNull();
    if (!backendUrl) {
        return NextResponse.json(
            { error: "BACKEND_URL not configured" },
            { status: 500 },
        );
    }

    // --- Enforce rate limiting and locking ---
    const rateLimitKey: string = `build_portfolio:user:${user.id}`;
    const rateLimitResponse: NextResponse | null = await enforceRateLimit(
        generateRateLimit,
        rateLimitKey,
    );

    if (rateLimitResponse) return rateLimitResponse;

    const lockKey: string = `build_portfolio:lock:user:${user.id}`;
    const lockAcquired: boolean = await acquireLock(lockKey, 600);

    if (!lockAcquired)
        return NextResponse.json(
            {
                error: "Portfolio generation already in progress, must wait",
            },
            { status: 409 },
        );

    try {
        // Fetch assets for this portfolio
        const { data: assets, error: assetsError } = await adminSupabase
            .from("assets")
            .select(
                "id, file_type, file_url, title, description, label, section_hint, alt",
            )
            .eq("portfolio_id", portfolioId);

        if (assetsError) {
            return NextResponse.json(
                { error: "Failed to fetch assets" },
                { status: 500 },
            );
        }

        // Forward to backend — returns 202 Accepted with { jobId }
        const res = await fetch(`${backendUrl}/api/v1/portfolio/refine/build`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                portfolioId,
                sessionId,
                sectionPlans,
                assets: (assets ?? []).map((asset) => ({
                    id: asset.id,
                    type: asset.file_type,
                    url: asset.file_url,
                    title: asset.title ?? "",
                    description: asset.description ?? "",
                    label: asset.label ?? "",
                    sectionHint: asset.section_hint ?? "",
                    alt: asset.alt ?? "",
                })),
            }),
        });

        let data: unknown = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (!res.ok) {
            const errorMessage =
                typeof data === "object" && data && "error" in data
                    ? (data as { error?: string }).error
                    : "Build request failed";
            return NextResponse.json(
                { error: errorMessage },
                { status: res.status },
            );
        }

        // Return { jobId } for client-side polling
        return NextResponse.json(data);
    } catch (err) {
        console.error("Build request error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    } finally {
        await releaseLock(lockKey);
    }
}
