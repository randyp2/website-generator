import { fetchBackend } from "@/lib/api/backendFetch";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const readBackendError = (payload: unknown): string | null => {
    if (typeof payload !== "object" || payload === null) return null;

    const errorPayload = payload as Record<string, unknown>;
    for (const key of ["error", "message", "detail"] as const) {
        const value = errorPayload[key];
        if (typeof value === "string" && value.trim()) return value;
    }
    return null;
};

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

        const res = await fetchBackend(
            `/api/v1/portfolio/${portfolioId}/versions`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!res.ok) {
            const errorPayload: unknown = await res.json().catch(() => null);
            return NextResponse.json(
                {
                    error:
                        readBackendError(errorPayload) ??
                        "Failed to fetch versions",
                },
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
