import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { uploadRateLimit } from "@/lib/rate-limit/ratelimit";
import { getBackendUrl } from "@/lib/server-env";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const STORAGE_BUCKET = "private_resumes";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const POST = async (req: Request) => {
    try {
        const formData = await req.formData();
        const resumeFile = formData.get("file");

        if (!(resumeFile instanceof File)) {
            return NextResponse.json(
                { error: "No resume file provided" },
                { status: 400 },
            );
        }

        const lastDotIndex: number = resumeFile.name.lastIndexOf(".");
        const extension =
            lastDotIndex >= 0 && lastDotIndex < resumeFile.name.length - 1
                ? resumeFile.name.slice(lastDotIndex + 1).toLowerCase()
                : "";
        const fallbackContentType = CONTENT_TYPE_BY_EXTENSION[extension];

        if (!fallbackContentType) {
            return NextResponse.json(
                { error: "Only PDF, DOC, and DOCX files are allowed" },
                { status: 400 },
            );
        }

        if (resumeFile.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: "Resume exceeds 5MB limit" },
                { status: 413 },
            );
        }

        const supabase = await createServerSupabaseClient();

        // Force auth validation with Supabase Auth server to reduce stale-token forwarding.
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

        const userId = user.id;

        const rateLimitResponse = await enforceRateLimit(
            uploadRateLimit,
            `upload_profile_resume_verification:user:${userId}`,
        );
        if (rateLimitResponse) return rateLimitResponse;

        const contentType = resumeFile.type || fallbackContentType;
        const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
        const storagePath: string = `resume-verifications/${userId}/${randomUUID()}.${extension}`;

        const { data: uploadData, error: uploadError } =
            await adminSupabase.storage
                .from(STORAGE_BUCKET)
                .upload(storagePath, fileBuffer, {
                    contentType,
                    upsert: true,
                });

        if (uploadError || !uploadData?.path) {
            console.error("Profile resume storage upload failed:", uploadError);
            return NextResponse.json(
                { error: "Failed to upload resume to storage" },
                { status: 500 },
            );
        }

        const uploadPayload = {
            rawFileBucket: STORAGE_BUCKET,
            rawFilePath: uploadData.path,
            originalFileName: resumeFile.name,
            contentType,
            fileSizeBytes: resumeFile.size,
        };

        // Resolve the session as close as possible to backend forwarding.
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
            `${backendUrl}/api/v1/profile/resume-verification/upload`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(uploadPayload),
            },
        );

        if (!response.ok) {
            let backendError = "";
            const responseContentType =
                response.headers.get("content-type") ?? "";

            if (responseContentType.includes("application/json")) {
                try {
                    const backendPayload = await response.json();
                    if (
                        backendPayload &&
                        typeof backendPayload === "object" &&
                        "error" in backendPayload &&
                        typeof backendPayload.error === "string"
                    ) {
                        backendError = backendPayload.error;
                    } else if (
                        backendPayload &&
                        typeof backendPayload === "object" &&
                        "message" in backendPayload &&
                        typeof backendPayload.message === "string"
                    ) {
                        backendError = backendPayload.message;
                    }
                } catch {
                    // Fallback to empty error body handling below.
                }
            } else {
                backendError = (await response.text()).trim();
            }

            console.error(
                "Backend profile resume verification upload failed:",
                response.status,
                backendError || "<empty>",
            );
            return NextResponse.json(
                {
                    error:
                        backendError ||
                        `Failed to persist resume verification metadata (status ${response.status})`,
                },
                { status: response.status },
            );
        }

        const payload = await response.json();
        return NextResponse.json(payload);
    } catch (error) {
        console.error(
            "Error in profile resume verification upload route:",
            error,
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
