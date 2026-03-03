import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const { id: portfolioId } = await context.params;

    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backendUrl = getBackendUrl();

        const res = await fetch(
            `${backendUrl}/api/v1/portfolio/${portfolioId}/load`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!res.ok) {
            console.error("Backend portfolio load failed:", res.status);
            return NextResponse.json(
                { error: "Failed to load portfolio" },
                { status: res.status },
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error("Portfolio load error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
