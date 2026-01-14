import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const body = await req.json();
        const { id: portfolioId } = await context.params;

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
            .select("id, user_id")
            .eq("id", portfolioId)
            .single();

        if (portfolioError || !portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 },
            );
        }

        // --- Fetch asssets for this portfolio
        const { data: assets, error: assetsError } = await adminSupabase
            .from("assets")
            .select(
                "id, file_type, file_url, title, description, label, section_hint, alt",
            )
            .eq("portfolio_id", portfolioId);

        const token = session.access_token;

        if (assetsError)
            return NextResponse.json(
                { error: "Failed to fetch assets" },
                { status: 500 },
            );

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
            body: JSON.stringify({
                ...body,
                assets: (assets ?? []).map((asset) => ({
                    id: asset.id,
                    type: asset.file_type,
                    url: asset.file_url,
                    title: asset.title ?? "",
                    description: asset.description ?? "",
                    label: asset.label ?? "",
                    sectionHint: asset.section_hint ?? "",
                    alt: asset.alt ?? "",
                })),
            }),
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
