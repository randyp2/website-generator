import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (
    _req: Request,
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

    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/api/v1/portfolio/${portfolioId}/unpublish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    if (!res.ok) {
        return NextResponse.json(
            { error: "Failed to unpublish portfolio" },
            { status: res.status },
        );
    }

    return NextResponse.json({ success: true });
};
