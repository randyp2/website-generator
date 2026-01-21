import { NextResponse } from "next/server";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const { id: portfolioId } = await context.params;

        if (!portfolioId) {
            return NextResponse.json(
                { error: "portfolioId is required" },
                { status: 400 },
            );
        }

        const supabase = await createServerSupabaseClient();

        // Use getUser() to verify authenticity with Supabase Auth server
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
            .select("id, user_id, template_id, active_version_id, title")
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

        let sections: any[] = [];
        let globalTheme: Record<string, unknown> | null = null;
        let assistantMessage: Record<string, unknown> | null = null;

        if (portfolio.active_version_id) {
            const { data: version } = await adminSupabase
                .from("generated_versions")
                .select("sections_snapshot, global_theme, assistant_message")
                .eq("id", portfolio.active_version_id)
                .single();

            const snapshot = version?.sections_snapshot as
                | { sections?: any[]; globalTheme?: Record<string, unknown> }
                | null
                | undefined;

            sections = Array.isArray(snapshot?.sections) ? snapshot.sections : [];
            globalTheme =
                (version?.global_theme as Record<string, unknown> | null) ??
                snapshot?.globalTheme ??
                null;
            assistantMessage =
                (version?.assistant_message as Record<string, unknown> | null) ??
                null;
        }

        if (sections.length === 0) {
            const { data: storedSections, error: sectionsError } =
                await adminSupabase
                    .from("portfolio_sections")
                    .select(
                        "section_key, title, react_source, content_json, order_index",
                    )
                    .eq("portfolio_id", portfolioId)
                    .order("order_index", { ascending: true });

            if (sectionsError) {
                return NextResponse.json(
                    { error: "Failed to load portfolio sections" },
                    { status: 500 },
                );
            }

            sections = (storedSections ?? []).map((section) => ({
                sectionKey: section.section_key,
                title: section.title,
                reactSource: section.react_source,
                contentJson: section.content_json ?? {},
                orderIndex: section.order_index ?? 0,
            }));
        }

        return NextResponse.json({
            portfolioId: portfolio.id,
            templateId: portfolio.template_id ?? null,
            title: portfolio.title ?? null,
            sections,
            globalTheme,
            assistantMessage,
        });
    } catch (err) {
        console.error("Portfolio load error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
