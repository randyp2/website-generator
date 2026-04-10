import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const PATCH = async (req: Request) => {
    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

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
                "Backend resume verification parsed update failed:",
                response.status,
                errorText,
            );
            return NextResponse.json(
                { error: "Failed to persist parsed resume data" },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch (error) {
        console.error(
            "Error in resume verification parsed route:",
            error,
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
