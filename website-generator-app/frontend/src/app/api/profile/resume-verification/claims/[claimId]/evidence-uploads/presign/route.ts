import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type PresignRequestBody = {
    originalFileName: string;
    contentType: string;
    fileSizeBytes: number;
};

const parseRequestBody = async (
    req: Request,
): Promise<PresignRequestBody | null> => {
    const body =
        ((await req
            .json()
            .catch(() => null)) as Partial<PresignRequestBody> | null) ?? null;

    if (
        !body ||
        typeof body.originalFileName !== "string" ||
        !body.originalFileName.trim() ||
        typeof body.contentType !== "string" ||
        !body.contentType.trim() ||
        typeof body.fileSizeBytes !== "number" ||
        Number.isNaN(body.fileSizeBytes) ||
        body.fileSizeBytes < 0
    ) {
        return null;
    }

    return {
        originalFileName: body.originalFileName.trim(),
        contentType: body.contentType.trim(),
        fileSizeBytes: body.fileSizeBytes,
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
                {
                    error: "originalFileName, contentType, and non-negative fileSizeBytes are required",
                },
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

        const { data: userData, error: userError } =
            await supabase.auth.getUser(session.access_token);
        if (userError || !userData?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const backendUrl: string = getBackendUrl();
        const response: Response = await fetch(
            `${backendUrl}/api/v1/profile/resume-verification/claims/${claimId}/evidence-uploads/presign`,
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
            const errorText = await response.text();
            console.error(
                "Backend claim evidence upload presign failed:",
                response.status,
                errorText,
            );
            return NextResponse.json(
                { error: "Failed to create upload URL" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in claim evidence upload presign route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
