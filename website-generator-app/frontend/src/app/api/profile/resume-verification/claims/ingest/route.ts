import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    try {
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

        const body = await req.json();

        const backendUrl: string = getBackendUrl();
        const response: Response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/claims/ingest`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Backend claim ingestion failed:",
                response.status,
                errorText,
            );
            return NextResponse.json(
                { error: "Failed to ingest skill claims" },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch (error) {
        console.error("Error in claim ingestion route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
