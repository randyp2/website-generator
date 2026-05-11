import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
    _req: Request,
    context: { params: Promise<{ id: string }> },
) => {
    try {
        const { id: jobId } = await context.params;

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

        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/jobs/status/${jobId}`,
            {
                method: "GET",
                cache: "no-store",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            return NextResponse.json(
                { error: errorText || "Job not found" },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch (error) {
        console.error("Error in verification job status route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
