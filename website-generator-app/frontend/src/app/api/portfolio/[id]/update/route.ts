import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type UpdatePortfolioBody = {
    title?: string;
    last_step?: string;
    template_id?: string;
    style_chat_history?: unknown[];
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

// --- OLD IMPL (direct Supabase) ---
// import { adminSupabase } from "@/utils/supabase/admin";
// import { isStyleChatHistory } from "@/lib/style-chat-history";
// import type { PersistedStyleChatMessage } from "@/types/style-chat";
//
// type UpdatePortfolioBody = {
//     title?: string;
//     last_step?: string;
//     template_id?: string;
//     style_chat_history?: PersistedStyleChatMessage[];
// };
//
// export const PATCH = async (
//     req: Request,
//     context: { params: Promise<{ id: string }> },
// ) => {
//     const { id: portfolioId } = await context.params;
//     const body = (await req.json()) as UpdatePortfolioBody | null;
//     const title = typeof body?.title === "string" ? body.title : undefined;
//     const lastStep = typeof body?.last_step === "string" ? body.last_step : undefined;
//     const templateId = typeof body?.template_id === "string" ? body.template_id : undefined;
//     const styleChatHistory = body?.style_chat_history;
//     const normalizedStyleChatHistory: PersistedStyleChatMessage[] | undefined | null =
//         styleChatHistory === undefined
//             ? undefined
//             : isStyleChatHistory(styleChatHistory)
//                 ? styleChatHistory
//                 : null;
//
//     if (normalizedStyleChatHistory === null) {
//         return NextResponse.json(
//             { error: "style_chat_history must be an array of chat messages" },
//             { status: 400 },
//         );
//     }
//
//     try {
//         const { data, error } = await adminSupabase
//             .from("portfolios")
//             .update({
//                 ...(title && { title }),
//                 ...(lastStep && { last_step: lastStep }),
//                 ...(templateId && { template_id: templateId }),
//                 ...(normalizedStyleChatHistory !== undefined && {
//                     style_chat_history: normalizedStyleChatHistory,
//                 }),
//                 updated_at: new Date().toISOString(),
//             })
//             .eq("id", portfolioId)
//             .select()
//             .single();
//
//         if (error) {
//             console.error("Update portfolio error:", error);
//             return NextResponse.json(
//                 { error: "Failed to update portfolio" },
//                 { status: 500 }
//             );
//         }
//
//         return NextResponse.json({ success: true, data });
//     } catch (err) {
//         console.error("Server error:", err);
//         return NextResponse.json(
//             { error: "Unexpected server error" },
//             { status: 500 },
//         );
//     }
// };
