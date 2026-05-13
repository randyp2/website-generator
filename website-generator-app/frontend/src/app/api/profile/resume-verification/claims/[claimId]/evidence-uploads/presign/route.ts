import { getBackendUrl } from "@/lib/server-env";
import {
    normalizeClaimEvidenceContentType,
    resolveClaimEvidenceContentType,
    validateClaimEvidenceUploadDescriptor,
} from "@/lib/verification/claimEvidenceUploadPolicy";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type PresignRequestBody = {
    originalFileName: string;
    contentType: string;
    fileSizeBytes: number;
};

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
        typeof body.fileSizeBytes !== "number" ||
        Number.isNaN(body.fileSizeBytes)
    ) {
        return null;
    }

    const originalFileName = body.originalFileName.trim();
    const resolvedContentType = resolveClaimEvidenceContentType(
        originalFileName,
        typeof body.contentType === "string" ? body.contentType : "",
    );

    return {
        originalFileName,
        contentType: normalizeClaimEvidenceContentType(resolvedContentType),
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
                    error: "originalFileName and fileSizeBytes are required",
                },
                { status: 400 },
            );
        }

        const validationError = validateClaimEvidenceUploadDescriptor(parsedBody);
        if (validationError) {
            return NextResponse.json(
                { error: validationError },
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
            const errorMessage = await readBackendErrorMessage(
                response,
                "Failed to create upload URL",
            );
            console.error(
                "Backend claim evidence upload presign failed:",
                response.status,
                errorMessage,
            );
            return NextResponse.json(
                { error: errorMessage },
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
