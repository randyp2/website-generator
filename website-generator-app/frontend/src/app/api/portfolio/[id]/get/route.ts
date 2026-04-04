import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const { id: portfolioId } = await context.params;

    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const backendUrl = getBackendUrl();

        const res = await fetch(
            `${backendUrl}/api/v1/portfolio/${portfolioId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!res.ok) {
            console.error("Backend portfolio get failed:", res.status);
            return NextResponse.json(
                { error: "Portfolio not found." },
                { status: res.status },
            );
        }

        const data = await res.json();

        // Translate camelCase fields back to snake_case so existing clients
        // (e.g. useStyleChat reading data?.portfolio?.style_chat_history) continue to work.
        const p = data.portfolio;
        return NextResponse.json({
            portfolio: {
                ...p,
                style_chat_history: p.styleChatHistory,
                last_step: p.lastStep,
                template_id: p.templateId,
                created_at: p.createdAt,
                updated_at: p.updatedAt,
            },
            resume: data.resume ?? null,
            assets: data.assets ?? [],
        });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}

// --- OLD IMPL (direct Supabase) ---
// import { adminSupabase } from "@/utils/supabase/admin";
//
// export async function GET(
//     req: Request,
//     context: { params: Promise<{ id: string }> }
// ) {
//
//     const { id: portfolioId } = await context.params;
//
//     try {
//         // Fetch portfolio row from supabase
//         const { data: portfolio, error: pError } = await adminSupabase
//             .from("portfolios")
//             .select("*")
//             .eq("id", portfolioId)
//             .single();
//
//         if (pError) {
//             console.error("Portfolio get error:", pError);
//             return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
//         }
//
//         // Fetch resume file metadata
//         const { data: resume, error: resumeError } = await adminSupabase
//             .from("resumes")
//             .select("*")
//             .eq("portfolio_id", portfolioId)
//             .single();
//
//         // Fetch media + video assets
//         const { data: assets, error: aError } = await adminSupabase
//             .from("assets")
//             .select("*")
//             .eq("portfolio_id", portfolioId);
//
//         return NextResponse.json({
//             portfolio,
//             resume: resume ?? null,
//             assets: assets ?? [],
//         });
//
//     } catch (err) {
//         console.error("Server error:", err);
//         return NextResponse.json(
//             { error: "Unexpected server error" },
//             { status: 500 }
//         );
//     }
// }
