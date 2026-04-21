import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (
    _req: Request,
    { params }: { params: Promise<{ provider: string }> },
) => {
    try {
        const { provider } = await params;

        // Authenticate on proxy route (Next.js BFF)
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Make backend call
        const backendUrl: string = getBackendUrl();
        const response: Response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/connections/${encodeURIComponent(provider)}/sync`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Backend provider sync failed:",
                response.status,
                errorText,
            );
            return NextResponse.json(
                { error: "Failed to sync provider" },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch (error) {
        console.error("Error in provider sync POST route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
