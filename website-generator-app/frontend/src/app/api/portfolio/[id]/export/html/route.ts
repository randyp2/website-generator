import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { cheapRateLimit } from "@/lib/rate-limit/ratelimit";
import { getBackendUrlOrNull } from "@/lib/server-env";

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const body = await req.json();
    const { sections, globalTheme, pageTitle } = body ?? {};
    const { id: portfolioId } = await context.params;

    if (!portfolioId) {
        return NextResponse.json(
            { error: "portfolioId is required" },
            { status: 400 },
        );
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
        return NextResponse.json(
            { error: "sections are required" },
            { status: 400 },
        );
    }

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

    const backendUrl = getBackendUrlOrNull();
    if (!backendUrl) {
        return NextResponse.json(
            { error: "BACKEND_URL not configured" },
            { status: 500 },
        );
    }

    // --- Enforce rate limiting ---
    const rateLimitKey = `export_html:user:${user.id}`;
    const rateLimitResponse = await enforceRateLimit(cheapRateLimit, rateLimitKey);

    if (rateLimitResponse) return rateLimitResponse;

    try {
        const res = await fetch(`${backendUrl}/api/portfolio/export/html`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sections,
                globalTheme: globalTheme ?? null,
                pageTitle: pageTitle ?? "Portfolio",
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Backend HTML export error:", errorText);
            return NextResponse.json(
                { error: "Failed to generate HTML" },
                { status: res.status },
            );
        }

        const html = await res.text();

        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": "attachment; filename=\"portfolio.html\"",
            },
        });
    } catch (err) {
        console.error("Export HTML request error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
