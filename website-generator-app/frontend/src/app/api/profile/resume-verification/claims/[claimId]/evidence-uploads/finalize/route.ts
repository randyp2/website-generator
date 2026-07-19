import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type FinalizeRequestBody = {
    uploadId: string;
    metadata?: unknown;
};

const readBackendErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        try {
            const body = (await response.json()) as Record<string, unknown>;
            for (const key of ["detail", "message", "error"] as const) {
                const value = body[key];
                if (typeof value === "string" && value.trim()) return value.trim();
            }
        } catch {
            // no-op, fallback below
        }
    }

    const errorText = (await response.text().catch(() => "")).trim();
    return errorText || fallback;
};

const parseRequestBody = async (
    req: Request,
): Promise<FinalizeRequestBody | null> => {
    const body =
        ((await req.json().catch(() => null)) as Partial<FinalizeRequestBody> | null) ??
        null;

    if (!body || typeof body.uploadId !== "string" || !body.uploadId.trim()) {
        return null;
    }

    return {
        uploadId: body.uploadId.trim(),
        metadata: body.metadata,
    };
};

export const POST = async (
    req: Request,
    { params }: { params: Promise<{ claimId: string }> },
) => {
    try {
        const parsedBody = await parseRequestBody(req);
        if (!parsedBody) {
            return NextResponse.json(
                { error: "uploadId is required" },
                { status: 400 },
            );
        }

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

        const { data: userData, error: userError } = await supabase.auth.getUser(
            session.access_token,
        );
        if (userError || !userData?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const backendUrl = getBackendUrl();
        const response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/claims/${claimId}/evidence-uploads/finalize`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(parsedBody),
            },
        );

        if (!response.ok) {
            const insufficientCredits = response.status === 402;
            const errorMessage = await readBackendErrorMessage(
                response,
                insufficientCredits
                    ? "An asset verification allowance or at least 1 credit is required."
                    : "Failed to finalize upload",
            );
            if (!insufficientCredits) {
                console.error(
                    "Backend claim evidence upload finalize failed:",
                    response.status,
                    errorMessage,
                );
            }
            return NextResponse.json(
                {
                    ...(insufficientCredits && {
                        code: "INSUFFICIENT_CREDITS",
                    }),
                    error: errorMessage,
                },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in claim evidence upload finalize route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
