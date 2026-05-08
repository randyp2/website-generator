import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const readBackendErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        try {
            const body = (await response.json()) as { error?: unknown; message?: unknown };
            if (typeof body.error === "string" && body.error.trim()) return body.error;
            if (typeof body.message === "string" && body.message.trim()) return body.message;
        } catch {
            // no-op, fallback below
        }
    }

    const errorText = (await response.text().catch(() => "")).trim();
    return errorText || fallback;
};

export const DELETE = async (
    _req: Request,
    {
        params,
    }: { params: Promise<{ claimId: string; uploadId: string }> },
) => {
    try {
        const { claimId, uploadId } = await params;

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

        const { data: userData, error: userError } =
            await supabase.auth.getUser(session.access_token);
        if (userError || !userData?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/claims/${claimId}/evidence-uploads/${uploadId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (!response.ok) {
            const errorMessage = await readBackendErrorMessage(
                response,
                "Failed to delete upload",
            );
            console.error(
                "Backend claim evidence upload delete failed:",
                response.status,
                errorMessage,
            );
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status },
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error in claim evidence upload delete route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
