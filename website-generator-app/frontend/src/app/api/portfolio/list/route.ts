import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

        const res = await fetch(`${backendUrl}/api/v1/portfolio/list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        if (!res.ok) {
            console.error("Backend portfolio list failed:", res.status);
            return NextResponse.json(
                { error: "Failed to fetch portfolios." },
                { status: res.status },
            );
        }

        const data = await res.json();
        const portfolios = Array.isArray(data?.portfolios)
            ? data.portfolios.map((portfolio: Record<string, unknown>) => ({
                  ...portfolio,
                  template_id:
                      (portfolio.template_id as string | null | undefined) ??
                      (portfolio.templateId as string | null | undefined) ??
                      null,
                  last_step:
                      (portfolio.last_step as string | null | undefined) ??
                      (portfolio.lastStep as string | null | undefined) ??
                      null,
                  style_chat_history:
                      (portfolio.style_chat_history as unknown[] | null | undefined) ??
                      (portfolio.styleChatHistory as unknown[] | null | undefined) ??
                      null,
                  refine_chat_history:
                      (portfolio.refine_chat_history as unknown[] | null | undefined) ??
                      (portfolio.refineChatHistory as unknown[] | null | undefined) ??
                      null,
                  slug:
                      (portfolio.slug as string | null | undefined) ?? null,
                  description:
                      (portfolio.description as string | null | undefined) ??
                      null,
                  created_at:
                      (portfolio.created_at as string | null | undefined) ??
                      (portfolio.createdAt as string | null | undefined) ??
                      null,
                  updated_at:
                      (portfolio.updated_at as string | null | undefined) ??
                      (portfolio.updatedAt as string | null | undefined) ??
                      null,
                  screenshot_url:
                      (portfolio.screenshot_url as string | null | undefined) ??
                      (portfolio.screenshotUrl as string | null | undefined) ??
                      null,
              }))
            : [];

        return NextResponse.json({
            ...data,
            portfolios,
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
// /**
//  * @param req Query parameter passed through url/path
//  * (i.e. /api/portfolio/list?userId=7913f5f7-a9a1-4688-be20-01a5adc11a4a)
//  * @returns HTTP status and/or list of portfolios
//  */
// export async function GET(req: Request, {}) {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get("userId");
//
//     if (!userId) {
//         return NextResponse.json(
//             { error: "userId and templateId are required." },
//             { status: 400 },
//         );
//     }
//
//     try {
//         const { data, error } = await adminSupabase
//             .from("portfolios")
//             .select("*")
//             .eq("user_id", userId)
//             .order("created_at", { ascending: false });
//
//         if (error) {
//             console.error("Portfolio get error:", error);
//             return NextResponse.json(
//                 { error: "Failed to fetch all portfolios." },
//                 { status: 500 },
//             );
//         }
//
//         return NextResponse.json({ portfolios: data });
//     } catch (err) {
//         console.error("Server error:", err);
//         return NextResponse.json(
//             { error: "Unexpected server error" },
//             { status: 500 },
//         );
//     }
// }
