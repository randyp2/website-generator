import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
    _req: Request,
    context: { params: Promise<{ id: string; versionId: string }> },
) {
    try {
        const { id: portfolioId, versionId } = await context.params;

        if (!portfolioId || !versionId) {
            return NextResponse.json(
                { error: "portfolioId and versionId are required" },
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
            `${backendUrl}/api/v1/portfolio/${portfolioId}/versions/${versionId}/activate`,
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
                { error: error?.message ?? "Failed to activate version" },
                { status: res.status },
            );
        }

        const data = await res.json();
        return NextResponse.json({
            portfolioId: data.portfolioId,
            activeVersionId: data.activeVersionId,
        });
    } catch (err) {
        console.error("Activate version error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
