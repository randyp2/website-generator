import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type DraftRequestBody = {
    templateId?: string;
};

const readBackendError = (payload: unknown): string | null => {
    if (!payload || typeof payload !== "object") return null;

    const errorPayload = payload as Record<string, unknown>;
    for (const key of ["detail", "message", "error"] as const) {
        const value = errorPayload[key];
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return null;
};

export const POST = async (req: Request) => {
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

        const body = (await req.json()) as DraftRequestBody | null;
        const templateId = typeof body?.templateId === "string" ? body.templateId : undefined;

        if (!templateId) {
            return NextResponse.json(
                { error: "templateId is required" },
                { status: 400 },
            );
        }

        const backendUrl = getBackendUrl();

        const res = await fetch(`${backendUrl}/api/v1/portfolio/draft`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ templateId }),
        });

        if (!res.ok) {
            const errorPayload: unknown = await res.json().catch(() => null);
            const insufficientCredits = res.status === 402;
            if (!insufficientCredits) {
                console.error("Backend draft creation failed:", res.status);
            }
            return NextResponse.json(
                {
                    ...(insufficientCredits && {
                        code: "INSUFFICIENT_CREDITS",
                    }),
                    error:
                        readBackendError(errorPayload) ??
                        (insufficientCredits
                            ? "A portfolio generation allowance or at least 10 credits is required."
                            : "Failed to create draft"),
                },
                { status: res.status },
            );
        }

        const portfolio = await res.json();
        return NextResponse.json({ portfolio }, { status: 201 });
    } catch (err) {
        console.error("Draft create server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
};

// --- OLD IMPL (direct Supabase) ---
// import { adminSupabase } from "@/utils/supabase/admin";
//
// export const POST = async (req: Request) => {
//     try {
//         const supabase = await createServerSupabaseClient();
//         const {
//             data: { user },
//             error: authError,
//         } = await supabase.auth.getUser();
//
//         if (!user || authError) {
//             return NextResponse.json(
//                 { error: "Unauthorized" },
//                 { status: 401 },
//             );
//         }
//
//         const body = (await req.json()) as DraftRequestBody | null;
//         const templateId = typeof body?.templateId === "string" ? body.templateId : undefined;
//
//         if (!templateId) {
//             return NextResponse.json(
//                 { error: "templateId is required" },
//                 { status: 400 },
//             );
//         }
//
//         const { data: portfolio, error } = await adminSupabase
//             .from("portfolios")
//             .insert({
//                 title: "Untitled Portfolio",
//                 user_id: user.id,
//                 template_id: templateId,
//                 status: "draft",
//                 last_step: "style",
//             })
//             .select()
//             .single();
//
//         if (error) {
//             console.error("Draft creation error:", error);
//             return NextResponse.json(
//                 { error: "Failed to create draft" },
//                 { status: 500 },
//             );
//         }
//
//         return NextResponse.json({ portfolio });
//     } catch (err) {
//         console.error("Draft create server error:", err);
//         return NextResponse.json(
//             { error: "Unexpected server error" },
//             { status: 500 },
//         );
//     }
// };
