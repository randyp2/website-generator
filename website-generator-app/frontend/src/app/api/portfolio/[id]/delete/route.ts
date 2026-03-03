import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    // Retrieve portfolio id from url
    const { id: portfolioId } = await params;

    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session)
        return NextResponse.json(
            { error: "Unauthorized access!" },
            { status: 401 },
        );

    const backendUrl = getBackendUrl();

    const res: Response = await fetch(
        `${backendUrl}/api/v1/portfolio/${portfolioId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        },
    );

    if (!res.ok) {
        console.error("Backend portfolio delete failed:", res.status);
        return NextResponse.json(
            { error: "Failed to delete portfolio." },
            { status: res.status },
        );
    }

    return NextResponse.json({ success: true });
}
