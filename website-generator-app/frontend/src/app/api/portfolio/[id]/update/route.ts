import { adminSupabase } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";
import { isStyleChatHistory } from "@/lib/style-chat-history";
import type { PersistedStyleChatMessage } from "@/types/style-chat";


type UpdatePortfolioBody = {
    title?: string;
    last_step?: string;
    template_id?: string;
    style_chat_history?: PersistedStyleChatMessage[];
};

export const PATCH = async (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => {

    const { id: portfolioId } = await context.params;

    const body = (await req.json()) as UpdatePortfolioBody | null;
    const title = typeof body?.title === "string" ? body.title : undefined;
    const lastStep = typeof body?.last_step === "string" ? body.last_step : undefined;
    const templateId = typeof body?.template_id === "string" ? body.template_id : undefined;
    const styleChatHistory = body?.style_chat_history;
    const normalizedStyleChatHistory: PersistedStyleChatMessage[] | undefined | null =
        styleChatHistory === undefined
            ? undefined
            : isStyleChatHistory(styleChatHistory)
                ? styleChatHistory
                : null;

    if (normalizedStyleChatHistory === null) {
        return NextResponse.json(
            { error: "style_chat_history must be an array of chat messages" },
            { status: 400 },
        );
    }

    try {
        const { data, error } = await adminSupabase
            .from("portfolios")
            .update({
                ...(title && { title }),
                ...(lastStep && { last_step: lastStep }),
                ...(templateId && { template_id: templateId }),
                ...(normalizedStyleChatHistory !== undefined && {
                    style_chat_history: normalizedStyleChatHistory,
                }),
                updated_at: new Date().toISOString(),
            })
            .eq("id", portfolioId)
            .select()
            .single();

        if (error) {
            console.error("Update portfolio error:", error);
            return NextResponse.json(
                { error: "Failed to update portfolio" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    }
};
