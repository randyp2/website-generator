import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { generateRateLimit } from "@/lib/rate-limit/ratelimit";
import { acquireLock, releaseLock } from "@/lib/rate-limit/redis-lock";
import { getBackendUrlOrNull } from "@/lib/server-env";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { request } from "undici";

// Type guard for error code:
//
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const body = await req.json();
    const { id: portfolioId } = await context.params;

    // --- Validate request body
    if (!body?.resume || !body?.templateId) {
        return NextResponse.json(
            {
                error: "Resume and templateId are required for portfolio generation",
            },
            { status: 400 },
        );
    }

    // --- Verify user
    const supabase = await createServerSupabaseClient();

    // Use getUser() to verify authenticity with Supabase Auth server
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

    // -- ENFORCE RATE LIMITING
    const rateLimitKey: string = `generate:user:${user.id}`;
    const rateLimitResponse = await enforceRateLimit(
        generateRateLimit,
        rateLimitKey,
    );

    if (rateLimitResponse) return rateLimitResponse;

    // --- Acquire lock for preventing concurrent requests
    const lockKey: string = `generate:lock:user:${user.id}`;
    const lockAcquired = await acquireLock(lockKey, 600); // 10 minutes

    if (!lockAcquired) {
        return NextResponse.json(
            {
                error: "Portfolio generation already in progress, must wait",
            },
            { status: 409 },
        );
    }

    try {
        // --- Portfolio id owner check
        const { data: portfolio, error: portfolioError } = await adminSupabase
            .from("portfolios")
            .select("id, user_id")
            .eq("id", portfolioId)
            .single();

        if (portfolioError || !portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 },
            );
        }

        if (portfolio.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // --- Fetch asssets for this portfolio
        const { data: assets, error: assetsError } = await adminSupabase
            .from("assets")
            .select(
                "id, file_type, file_url, title, description, label, section_hint, alt",
            )
            .eq("portfolio_id", portfolioId);

        const token = session.access_token;

        if (assetsError)
            return NextResponse.json(
                { error: "Failed to fetch assets" },
                { status: 500 },
            );

        // Validate backend url config
        const backendUrl = getBackendUrlOrNull();
        if (!backendUrl) {
            return NextResponse.json(
                { error: "BACKEND_URL not configured" },
                { status: 500 },
            );
        }

        // Call backend api with extended timeout handling
        console.log(
            "[generate] Calling backend API for portfolio generation...",
        );

        const requestBody = JSON.stringify({
            ...body,
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
        });

        let statusCode: number;
        let responseBody: string;

        try {
            // Use undici directly to configure extended timeouts (10 minutes)
            const { statusCode: status, body: resBody } = await request(
                `${backendUrl}/api/v1/portfolio/${portfolioId}/generate`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: requestBody,
                    headersTimeout: 600000, // 10 minutes for headers
                    bodyTimeout: 600000, // 10 minutes for body
                },
            );
            statusCode = status;
            responseBody = await resBody.text();
        } catch (err) {
            // Type gurad -> Check if object and has code property
            const errorCode =
                err && typeof err === "object" && "code" in err
                    ? (err as { code: unknown }).code
                    : undefined;

            console.error("[generate] Backend request failed:", {
                code: errorCode,
                message: err instanceof Error ? err.message : String(err),
            });

            if (
                errorCode === "UND_ERR_HEADERS_TIMEOUT" ||
                errorCode === "UND_ERR_BODY_TIMEOUT"
            ) {
                return NextResponse.json(
                    {
                        error: "Portfolio generation timed out. Please try again.",
                    },
                    { status: 504 },
                );
            }
            throw err;
        }

        console.log("[generate] Backend responded with status:", statusCode);

        // Parse response JSON
        let data;
        try {
            data = JSON.parse(responseBody);
        } catch {
            console.error(
                "[generate] Failed to parse response:",
                responseBody.slice(0, 500),
            );
            return NextResponse.json(
                { error: "Invalid response from backend" },
                { status: 502 },
            );
        }

        // Check response status
        if (statusCode < 200 || statusCode >= 300) {
            console.error("[generate] Backend error:", data);
            return NextResponse.json(
                { error: data?.error ?? "Portfolio generation failed" },
                { status: statusCode },
            );
        }

        console.log(
            "[generate] Successfully received portfolio data with",
            data?.sections?.length ?? 0,
            "sections",
        );

        // DB writes (generated_versions, portfolio active_version_id, portfolio_sections)
        // are now handled by Spring Boot inside POST /api/v1/portfolio/{id}/generate.

        // const sectionsSnapshot = {
        //     sections: data?.sections ?? [],
        //     globalTheme: data?.globalTheme ?? null,
        // };

        // console.log("[generate] Saving generated version to database...");
        // const { data: version, error: versionError } = await adminSupabase
        //     .from("generated_versions")
        //     .insert({
        //         portfolio_id: portfolioId,
        //         prompt_used: body?.userPrompt ?? null,
        //         model_used: null,
        //         sections_snapshot: sectionsSnapshot,
        //         global_theme: data?.globalTheme ?? null,
        //         assistant_message: data?.assistantMessage ?? null,
        //         preview_url: data?.previewUrl ?? null,
        //         html: "", // Required NOT NULL field - empty since we use React components
        //     })
        //     .select("id")
        //     .single();

        // if (versionError || !version) {
        //     console.error("[generate] Failed to persist generated version:", versionError);
        //     return NextResponse.json({ error: "Failed to persist generated version" }, { status: 500 });
        // }
        // console.log("[generate] Version saved with id:", version.id);

        // console.log("[generate] Updating portfolio active_version_id...");
        // const { error: portfolioUpdateError } = await adminSupabase
        //     .from("portfolios")
        //     .update({ active_version_id: version.id, updated_at: new Date().toISOString() })
        //     .eq("id", portfolioId);

        // if (portfolioUpdateError) {
        //     console.error("[generate] Failed to set active version:", portfolioUpdateError);
        //     return NextResponse.json({ error: "Failed to set active version" }, { status: 500 });
        // }
        // console.log("[generate] Portfolio active version updated");

        // const sections = Array.isArray(data?.sections) ? data.sections : [];
        // console.log("[generate] Upserting", sections.length, "sections...");
        // const { error: sectionsError } = await adminSupabase
        //     .from("portfolio_sections")
        //     .upsert(
        //         sections.map((section: GeneratedSection, index: number) => ({
        //             portfolio_id: portfolioId,
        //             section_key: section.sectionKey,
        //             title: section.title ?? null,
        //             react_source: section.reactSource ?? null,
        //             content_json: section.contentJson ?? {},
        //             order_index: section.orderIndex ?? index,
        //             source: "ai",
        //             updated_at: new Date().toISOString(),
        //         })),
        //         { onConflict: "portfolio_id,section_key" },
        //     );

        // if (sectionsError) {
        //     console.error("[generate] Failed to persist sections:", sectionsError);
        //     return NextResponse.json({ error: "Failed to persist sections" }, { status: 500 });
        // }
        // console.log("[generate] All sections saved successfully");

        return NextResponse.json(data);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorName = err instanceof Error ? err.name : "Unknown";
        console.error("[generate] Portfolio generate request error:", {
            name: errorName,
            message: errorMessage,
            stack: err instanceof Error ? err.stack : undefined,
        });

        return NextResponse.json(
            { error: `Unexpected server error: ${errorMessage}` },
            { status: 500 },
        );
    } finally {
        await releaseLock(lockKey); // Release lock
    }
}
