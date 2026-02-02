import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { data: portfolio, error: portfolioError } = await adminSupabase
            .from("portfolios")
            .select("id, user_id, active_version_id")
            .eq("id", portfolioId)
            .single();

        if (portfolioError || !portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 },
            );
        }

        if (portfolio.user_id !== user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            );
        }

        const { data: versions, error: versionsError } = await adminSupabase
            .from("generated_versions")
            .select(
                "id, created_at, assistant_message, prompt_used, preview_url",
            )
            .eq("portfolio_id", portfolioId)
            .order("created_at", { ascending: false });

        if (versionsError) {
            return NextResponse.json(
                { error: "Failed to fetch versions" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            versions: (versions ?? []).map((version) => ({
                ...version,
                is_active: version.id === portfolio.active_version_id,
            })),
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
};
