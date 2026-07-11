import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
    _req: Request,
    context: { params: Promise<{ id: string }> },
) => {
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
            `${backendUrl}/api/v1/portfolio/${portfolioId}/versions`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: error?.message ?? "Failed to fetch versions" },
                { status: res.status },
            );
        }

        const data = await res.json();

        // Translate camelCase from Spring Boot → snake_case expected by the frontend
        return NextResponse.json({
            versions: (data.versions ?? []).map((v: {
                id: string;
                createdAt: string;
                assistantMessage: unknown;
                promptUsed: string | null;
                previewUrl: string | null;
                active: boolean;
                published?: boolean;
            }) => ({
                id: v.id,
                created_at: v.createdAt,
                assistant_message: v.assistantMessage,
                prompt_used: v.promptUsed,
                preview_url: v.previewUrl,
                is_active: v.active,
                is_published: v.published === true,
            })),
        });
    } catch (error) {
        console.error("Versions fetch error:", error);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
};
