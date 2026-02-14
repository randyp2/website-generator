import { NextResponse } from "next/server";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function POST(
    _req: Request,
    context: { params: Promise<{ id: string; versionId: string }> },
) {
    try {
        const { id: portfolioId, versionId } = await context.params;

        if (!portfolioId || !versionId) {
            return NextResponse.json(
                { error: "portfolioId and versionId are required" },
                { status: 400 },
            );
        }

        // Validate user
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

        // Get portfolio that matches the current portfolioId
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

        if (portfolio.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get the generate_version row that equals this
        const { data: version, error: versionError } = await adminSupabase
            .from("generated_versions")
            .select("id, portfolio_id")
            .eq("id", versionId)
            .eq("portfolio_id", portfolioId)
            .single();

        // Ensure this version exists
        if (versionError || !version) {
            return NextResponse.json(
                { error: "Version not found" },
                { status: 404 },
            );
        }

        // Update the active version id to versionId
        const { error: updateError } = await adminSupabase
            .from("portfolios")
            .update({
                active_version_id: versionId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", portfolioId);

        if (updateError) {
            return NextResponse.json(
                { error: "Failed to activate version" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            portfolioId,
            activeVersionId: versionId,
        });
    } catch (err) {
        console.error("Activate version error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
