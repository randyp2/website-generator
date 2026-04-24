import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const username = req.nextUrl.searchParams.get("username") ?? "";
        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/profile/username-available?username=${encodeURIComponent(username)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                cache: "no-store",
            },
        );

        if (!response.ok) {
            return NextResponse.json(
                { username, available: false, reason: "error" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in /api/profile/username-available:", error);
        return NextResponse.json(
            { username: null, available: false, reason: "error" },
            { status: 500 },
        );
    }
};
