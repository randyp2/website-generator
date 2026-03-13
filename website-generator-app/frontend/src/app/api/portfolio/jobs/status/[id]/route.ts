import { getBackendUrlOrNull } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
    _req: Request,
    context: { params: Promise<{ id: string }> },
) => {
    const { id: jobId } = await context.params;

    const supabase = await createServerSupabaseClient();

    // Extract session details
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session_token: string = session.access_token;

    // Backend api call
    const backendUrl: string | null = getBackendUrlOrNull();
    if (!backendUrl)
        return NextResponse.json(
            { error: "Backend not configured" },
            { status: 500 },
        );

    const res: Response = await fetch(
        `${backendUrl}/api/v1/portfolio/jobs/status/${jobId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session_token}`,
            },
        },
    );

    if (!res.ok)
        return NextResponse.json(
            { error: "Job not found" },
            { status: res.status },
        );

    const data = await res.json();
    return NextResponse.json(data);
};
