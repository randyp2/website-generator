import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * PATCH /api/profile/resume-verification/review
 *
 * Persists the user's reviewed (human-edited) version of their parsed resume
 * data. Distinct from /parsed, which stores the raw AI parser output.
 * Calls the same underlying backend endpoint but represents a deliberate
 * user action rather than an automated parse result.
 */
export const PATCH = async (req: Request) => {
    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/parsed`,
            {
                method: "PATCH",
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
                "Backend resume review save failed:",
                response.status,
                errorText,
            );
            return NextResponse.json(
                { error: "Failed to save reviewed resume data" },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch (error) {
        console.error("Error in resume verification review route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
