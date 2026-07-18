import { fetchBackend } from "@/lib/api/backendFetch";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type UpdatePortfolioBody = {
    title?: string;
    last_step?: string;
    template_id?: string;
    style_chat_history?: unknown[];
    refine_chat_history?: unknown[];
    description?: string;
};

const readBackendError = async (response: Response): Promise<string> => {
    const rawBody = await response.text().catch(() => "");
    if (!rawBody.trim()) return "Failed to update portfolio";

    try {
        const payload: unknown = JSON.parse(rawBody);
        if (typeof payload === "object" && payload !== null) {
            const errorPayload = payload as Record<string, unknown>;
            for (const key of ["error", "message", "detail"] as const) {
                const value = errorPayload[key];
                if (typeof value === "string" && value.trim()) {
                    return value.trim();
                }
            }
        }
    } catch {
        return rawBody.trim();
    }

    return "Failed to update portfolio";
};

export const PATCH = async (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => {
    const { id: portfolioId } = await context.params;

    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as UpdatePortfolioBody | null;
    const description =
        typeof body?.description === "string" ? body.description : undefined;

    const res = await fetchBackend(`/api/v1/portfolio/${portfolioId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
        },
        // Translate snake_case from client to camelCase for Spring Boot
        body: JSON.stringify({
            title: body?.title,
            lastStep: body?.last_step,
            templateId: body?.template_id,
            styleChatHistory: body?.style_chat_history,
            refineChatHistory: body?.refine_chat_history,
            description,
        }),
    });

    if (!res.ok) {
        const error = await readBackendError(res);
        console.error("Backend portfolio update failed:", res.status, error);
        return NextResponse.json(
            { error },
            { status: res.status },
        );
    }

    const portfolio = await res.json();
    return NextResponse.json({ success: true, data: portfolio });
};
