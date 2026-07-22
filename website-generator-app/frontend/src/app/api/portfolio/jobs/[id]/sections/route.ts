import { getBackendUrlOrNull } from "@/lib/server-env";
import { CompletedSectionsResponse } from "@/types/portfolio";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
    _req: Request,
    context: { params: Promise<{ id: string }> },
) => {
    const { id: jobId } = await context.params;

    // Parse 'after' query param
    const url = new URL(_req.url);
    const after = url.searchParams.get("after") ?? "0";

    // Extract session information
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session_token: string = session.access_token;

    // Call backend api
    const backendUrl: string | null = getBackendUrlOrNull();
    if (!backendUrl)
        return NextResponse.json(
            { error: "Backend not configured" },
            { status: 500 },
        );

    const res: Response = await fetch(
        `${backendUrl}/api/v1/portfolio/jobs/${jobId}/sections?after=${after}`,
        {
            method: "GET",
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${session_token}`,
            },
        },
    );

    if (!res.ok)
        return NextResponse.json(
            { error: "Failed to fetch sections" },
            { status: res.status },
        );

    const data: CompletedSectionsResponse = await res.json();
    return NextResponse.json(data);
};
