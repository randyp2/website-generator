import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/portfolio/[id]/versions/publish-current
 *
 * Pins the portfolio's current active version as the one served on the
 * public site ("Publish changes" after refining a published portfolio).
 */
export async function POST(
    _req: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const { id: portfolioId } = await context.params;

        if (!portfolioId) {
            return NextResponse.json(
                { error: "portfolioId is required" },
                { status: 400 },
            );
        }

        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backendUrl = getBackendUrl();
        const res = await fetch(
            `${backendUrl}/api/v1/portfolio/${portfolioId}/versions/publish-current`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: error?.message ?? "Failed to publish changes" },
                { status: res.status },
            );
        }

        const data = await res.json();
        return NextResponse.json({
            portfolioId: data.portfolioId,
            publishedVersionId: data.activeVersionId,
        });
    } catch (err) {
        console.error("Publish current version error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
