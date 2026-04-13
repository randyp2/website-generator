import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const DELETE = async (
    _req: Request,
    { params }: { params: Promise<{ claimId: string }> },
) => {
    try {
        const { claimId } = await params;

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

        const backendUrl: string = getBackendUrl();
        const response: Response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/claims/${claimId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Backend delete claim failed:",
                response.status,
                errorText,
            );
            return NextResponse.json(
                { error: "Failed to delete claim" },
                { status: response.status },
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error in claim DELETE route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
