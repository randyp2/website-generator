import { getBackendUrl } from "@/lib/server-env";
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

    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/api/v1/portfolio/${portfolioId}`, {
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
        console.error("Backend portfolio update failed:", res.status);
        return NextResponse.json(
            { error: "Failed to update portfolio" },
            { status: res.status },
        );
    }

    const portfolio = await res.json();
    return NextResponse.json({ success: true, data: portfolio });
};
