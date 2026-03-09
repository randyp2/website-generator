import { NextResponse } from "next/server";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { GeneratedSection } from "@/types/portfolio";
import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { generateRateLimit } from "@/lib/rate-limit/ratelimit";
import { acquireLock, releaseLock } from "@/lib/rate-limit/redis-lock";
import { getBackendUrlOrNull } from "@/lib/server-env";

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const body = await req.json();
    const { sections, sectionPlans } = body ?? {};
    const { id: portfolioId } = await context.params;

    if (!portfolioId) {
        return NextResponse.json(
            { error: "portfolioId is required" },
            { status: 400 },
        );
    }

    if (!sectionPlans || !Array.isArray(sectionPlans)) {
        return NextResponse.json(
            { error: "sectionPlans are required" },
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session for the access token (needed for backend call)
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const backendUrl = getBackendUrlOrNull();
    if (!backendUrl) {
        return NextResponse.json(
            { error: "BACKEND_URL not configured" },
            { status: 500 },
        );
    }

    // --- Enforce rate limiting and locking ---
    const rateLimitKey: string = `build_portfolio:user:${user.id}`;
    const rateLimitResponse: NextResponse | null = await enforceRateLimit(
        generateRateLimit,
        rateLimitKey,
    );

    if (rateLimitResponse) return rateLimitResponse;

    const lockKey: string = `build_portfolio:lock:user:${user.id}`;
    const lockAcquired: boolean = await acquireLock(lockKey, 600);

    if (!lockAcquired)
        return NextResponse.json(
            {
                error: "Portfolio generation already in progress, must wait",
            },
            { status: 409 },
        );

    try {
        // Fetch assets for this portfolio
        const { data: assets, error: assetsError } = await adminSupabase
            .from("assets")
            .select(
                "id, file_type, file_url, title, description, label, section_hint, alt",
            )
            .eq("portfolio_id", portfolioId);

        if (assetsError) {
            return NextResponse.json(
                { error: "Failed to fetch assets" },
                { status: 500 },
            );
        }

        const res = await fetch(`${backendUrl}/api/v1/portfolio/refine/build`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                portfolioId,
                sections: Array.isArray(sections) ? sections : [],
                sectionPlans,
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

        let data: unknown = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (!res.ok) {
            const errorMessage =
                typeof data === "object" && data && "error" in data
                    ? (data as { error?: string }).error
                    : "Build request failed";
            return NextResponse.json(
                { error: errorMessage },
                { status: res.status },
            );
        }

        const buildResult = data as {
            buildSummary?: string;
            modifiedSections?: Array<{
                sectionKey: string;
                title?: string | null;
                orderIndex?: number | null;
                reactSource?: string | null;
                contentJson?: Record<string, unknown> | null;
            }>;
            deletedSectionKeys?: string[] | null;
            globalTheme?: Record<string, unknown> | null;
        };

        const baseSections: GeneratedSection[] = Array.isArray(sections)
            ? sections
            : [];
        const modifiedSections: GeneratedSection[] = Array.isArray(
            buildResult?.modifiedSections,
        )
            ? buildResult.modifiedSections
            : [];
        const deletedSectionKeys = Array.isArray(
            buildResult?.deletedSectionKeys,
        )
            ? buildResult.deletedSectionKeys
            : [];
        const deletedKeySet = new Set(deletedSectionKeys);
        const effectiveModifiedSections = modifiedSections.filter(
            (section) => !deletedKeySet.has(section.sectionKey),
        );
        if (data && typeof data === "object") {
            (data as { modifiedSections?: unknown }).modifiedSections =
                effectiveModifiedSections;
        }

        if (modifiedSections.length > 0 || deletedSectionKeys.length > 0) {
            const filteredBaseSections = baseSections.filter(
                (section: GeneratedSection) =>
                    !deletedKeySet.has(section.sectionKey),
            );
            const baseByKey = new Map(
                filteredBaseSections.map((section: GeneratedSection) => [
                    section.sectionKey,
                    section,
                ]),
            );

            const maxOrderIndex = filteredBaseSections.reduce(
                (max: number, section: GeneratedSection) =>
                    Math.max(max, section.orderIndex ?? 0),
                0,
            );

            const updatedSections = filteredBaseSections.map(
                (section: GeneratedSection) => {
                    const modified = effectiveModifiedSections.find(
                        (mod) => mod.sectionKey === section.sectionKey,
                    );
                    if (!modified) return section;
                    return {
                        ...section,
                        title: modified.title ?? section.title,
                        orderIndex:
                            modified.orderIndex ?? section.orderIndex ?? 0,
                        reactSource:
                            modified.reactSource ?? section.reactSource,
                        contentJson:
                            modified.contentJson ?? section.contentJson,
                    };
                },
            );

            let nextOrderIndex = maxOrderIndex + 1;
            const newSections = effectiveModifiedSections
                .filter((section) => !baseByKey.has(section.sectionKey))
                .map((section) => ({
                    sectionKey: section.sectionKey,
                    title: section.title ?? null,
                    orderIndex:
                        typeof section.orderIndex === "number"
                            ? section.orderIndex
                            : nextOrderIndex++,
                    reactSource: section.reactSource ?? null,
                    contentJson: section.contentJson ?? {},
                }));

            const updatedSectionsWithNew = updatedSections.concat(newSections);

            const sectionsSnapshot = {
                sections: updatedSectionsWithNew,
                globalTheme: buildResult?.globalTheme ?? null,
            };

            const { data: version, error: versionError } = await adminSupabase
                .from("generated_versions")
                .insert({
                    portfolio_id: portfolioId,
                    prompt_used: null,
                    model_used: null,
                    sections_snapshot: sectionsSnapshot,
                    global_theme: buildResult?.globalTheme ?? null,
                    assistant_message: buildResult?.buildSummary
                        ? { summary: buildResult.buildSummary }
                        : null,
                    html: "", // Required NOT NULL field
                })
                .select("id")
                .single();

            if (versionError || !version) {
                return NextResponse.json(
                    { error: "Failed to persist build version" },
                    { status: 500 },
                );
            }

            const { error: portfolioUpdateError } = await adminSupabase
                .from("portfolios")
                .update({
                    active_version_id: version.id,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", portfolioId);

            if (portfolioUpdateError) {
                return NextResponse.json(
                    { error: "Failed to set active version" },
                    { status: 500 },
                );
            }

            if (effectiveModifiedSections.length > 0) {
                const { error: sectionsError } = await adminSupabase
                    .from("portfolio_sections")
                    .upsert(
                        effectiveModifiedSections.map((section) => ({
                            portfolio_id: portfolioId,
                            section_key: section.sectionKey,
                            title:
                                section.title ??
                                baseByKey.get(section.sectionKey)?.title ??
                                null,
                            react_source: section.reactSource ?? null,
                            content_json: section.contentJson ?? {},
                            order_index:
                                section.orderIndex ??
                                baseByKey.get(section.sectionKey)?.orderIndex ??
                                0,
                            source: "ai",
                            updated_at: new Date().toISOString(),
                        })),
                        { onConflict: "portfolio_id,section_key" },
                    );

                if (sectionsError) {
                    return NextResponse.json(
                        { error: "Failed to persist modified sections" },
                        { status: 500 },
                    );
                }
            }

            if (deletedSectionKeys.length > 0) {
                const { data: deletedRows, error: deletedRowsError } =
                    await adminSupabase
                        .from("portfolio_sections")
                        .select("id")
                        .eq("portfolio_id", portfolioId)
                        .in("section_key", deletedSectionKeys);

                if (deletedRowsError) {
                    return NextResponse.json(
                        { error: "Failed to fetch sections for deletion" },
                        { status: 500 },
                    );
                }

                const deletedSectionIds = (deletedRows ?? [])
                    .map((row) => row.id)
                    .filter(Boolean);

                if (deletedSectionIds.length > 0) {
                    const { error: deleteVersionsError } = await adminSupabase
                        .from("portfolio_section_versions")
                        .delete()
                        .in("section_id", deletedSectionIds);

                    if (deleteVersionsError) {
                        return NextResponse.json(
                            { error: "Failed to delete section versions" },
                            { status: 500 },
                        );
                    }
                }

                const { error: deleteSectionsError } = await adminSupabase
                    .from("portfolio_sections")
                    .delete()
                    .eq("portfolio_id", portfolioId)
                    .in("section_key", deletedSectionKeys);

                if (deleteSectionsError) {
                    return NextResponse.json(
                        { error: "Failed to delete sections" },
                        { status: 500 },
                    );
                }
            }

            if (effectiveModifiedSections.length > 0) {
                const { data: sectionRows, error: sectionRowsError } =
                    await adminSupabase
                        .from("portfolio_sections")
                        .select("id, section_key")
                        .eq("portfolio_id", portfolioId)
                        .in(
                            "section_key",
                            effectiveModifiedSections.map(
                                (section) => section.sectionKey,
                            ),
                        );

                if (sectionRowsError) {
                    return NextResponse.json(
                        { error: "Failed to fetch persisted sections" },
                        { status: 500 },
                    );
                }

                const sectionIdByKey = new Map(
                    (sectionRows ?? []).map((row) => [row.section_key, row.id]),
                );

                const { error: versionsError } = await adminSupabase
                    .from("portfolio_section_versions")
                    .insert(
                        effectiveModifiedSections.map((section) => ({
                            section_id: sectionIdByKey.get(section.sectionKey),
                            react_source: section.reactSource ?? null,
                            content_json: section.contentJson ?? {},
                            prompt_used: null,
                            model_used: null,
                            created_by: user.id,
                        })),
                    );

                if (versionsError) {
                    return NextResponse.json(
                        { error: "Failed to persist section versions" },
                        { status: 500 },
                    );
                }
            }
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Build request error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    } finally {
        await releaseLock(lockKey);
    }
}
