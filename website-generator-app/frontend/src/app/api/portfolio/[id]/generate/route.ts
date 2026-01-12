import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const body = await req.json();

        // --- Validate request body
        if (!body?.resume || !body?.templateId) {
            return NextResponse.json(
                {
                    error: "Resume and templateId are required for portfolio generation",
                },
                { status: 400 },
            );
        }

        // --- Extract user JWT
        const supabase = await createServerSupabaseClient();

        const {
            data: { session },
            error: authError,
        } = await supabase.auth.getSession();

        // Validate auth
        if (authError || !session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // --- Portfolio id owner check
        const { data: portfolio, error: portfolioError } = await adminSupabase
            .from("portfolios")
            .select("id, user_id");

        const token = session.access_token;

        // Validate backend url config
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            return NextResponse.json(
                { error: "BACKEND_URL not configured" },
                { status: 500 },
            );
        }

        // Call backend api
        const res = await fetch(`${backendUrl}/api/portfolio/generate`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`, // JWT
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data?.error ?? "Portfolio generation failed" },
                { status: res.status },
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Portfolio generate request error: ", err);

        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
