import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (
    req: Request,
    context: { params: Promise<{ id: string }> },
) => {
    const { id: portfolioId } = await context.params;

    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/api/v1/portfolio/${portfolioId}/publish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: body?.slug ?? null }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
            { error: errorText || "Failed to publish portfolio" },
            { status: res.status },
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
};
