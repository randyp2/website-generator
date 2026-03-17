import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { uploadRateLimit } from "@/lib/rate-limit/ratelimit";
import { getBackendUrl } from "@/lib/server-env";
import { AssetMeta } from "@/types/portfolio";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const parseMeta = (raw: FormDataEntryValue | null): AssetMeta[] => {
    if (!raw || typeof raw !== "string") return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const POST = async (req: Request) => {
    // --- Get session (needed for user.id + access_token) ---
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session)
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );

    // --- Enforce rate limiting ---
    const rateLimitKey: string = `upload_portfolio:user:${session.user.id}`;
    const rateLimitResponse: NextResponse | null = await enforceRateLimit(
        uploadRateLimit,
        rateLimitKey,
    );

    if (rateLimitResponse) return rateLimitResponse;

    // --- Parse request body ---
    try {
        const formData = await req.formData();

        const rawTemplateId = formData.get("templateId");
        const rawPortfolioId = formData.get("portfolioId");

        const templateId = typeof rawTemplateId === "string" ? rawTemplateId : "";
        const portfolioId =
            typeof rawPortfolioId === "string" ? rawPortfolioId : null;

        const resumeFile = formData.get("resumeFile");
        const mediaFiles = formData.getAll("mediaFiles");
        const videoFiles = formData.getAll("videoFiles");
        const mediaMeta = parseMeta(formData.get("mediaMeta"));
        const videoMeta = parseMeta(formData.get("videoMeta"));

        if (!portfolioId) {
            return NextResponse.json(
                { error: "portfolioId is required." },
                { status: 400 },
            );
        }

        if (!templateId) {
            return NextResponse.json(
                { error: "templateId is required." },
                { status: 400 },
            );
        }

        // ==============================================================
        // UPLOAD RESUME (optional)
        // ==============================================================
        let publicResumeUrl: string | null = null;

        if (resumeFile instanceof File) {
            const ext = resumeFile.name.split(".").pop()?.toLowerCase();
            if (!["pdf", "docx"].includes(ext || "")) {
                return NextResponse.json(
                    { error: "Invalid file type. Only PDF and DOCX allowed." },
                    { status: 400 },
                );
            }

            const bytes = await resumeFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const storagePath = `resumes/${portfolioId}/${randomUUID()}.${ext}`;

            const { data: uploadData, error: uploadError } =
                await adminSupabase.storage
                    .from("portfolio_uploads")
                    .upload(storagePath, buffer, {
                        contentType: resumeFile.type,
                        upsert: false,
                    });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return NextResponse.json(
                    { error: "Failed to upload file to storage." },
                    { status: 500 },
                );
            }

            const { data: publicResumeUrlData } = adminSupabase.storage
                .from("portfolio_uploads")
                .getPublicUrl(uploadData.path);

            publicResumeUrl = publicResumeUrlData.publicUrl;
        }

        // ==============================================================
        // UPLOAD MEDIA FILES
        // ==============================================================
        const mediaAssets = [];

        for (let index = 0; index < mediaFiles.length; index += 1) {
            const fileItem = mediaFiles[index];
            if (!(fileItem instanceof File)) continue;

            const meta = mediaMeta[index] ?? {};
            const fallbackName = meta.name ?? fileItem.name ?? "";
            const fallbackLabel = meta.title || meta.label || fallbackName;
            const fallbackAlt =
                meta.alt || meta.description || meta.title || fallbackName;
            const fileExt = fileItem.name.split(".").pop();
            const fileBuffer = Buffer.from(await fileItem.arrayBuffer());

            const mediaPath = `media/${portfolioId}/${randomUUID()}.${fileExt}`;

            const { data } = await adminSupabase.storage
                .from("portfolio_uploads")
                .upload(mediaPath, fileBuffer);

            const { data: url } = adminSupabase.storage
                .from("portfolio_uploads")
                .getPublicUrl(data?.path ?? "");

            mediaAssets.push({
                type: "image",
                url: url.publicUrl,
                title: meta.title ?? "",
                description: meta.description ?? "",
                label: fallbackLabel,
                sectionHint: meta.sectionHint ?? "",
                alt: fallbackAlt,
            });
        }

        // ==============================================================
        // UPLOAD VIDEO FILES (optional)
        // ==============================================================
        const videoAssets = [];

        for (let index = 0; index < videoFiles.length; index += 1) {
            const fileItem = videoFiles[index];
            if (!(fileItem instanceof File)) continue;

            const meta = videoMeta[index] ?? {};
            const fallbackName = meta.name ?? fileItem.name ?? "";
            const fallbackLabel = meta.title || meta.label || fallbackName;
            const fallbackAlt =
                meta.alt || meta.description || meta.title || fallbackName;
            const fileExt = fileItem.name.split(".").pop();
            const fileBuffer = Buffer.from(await fileItem.arrayBuffer());

            const videoPath = `videos/${portfolioId}/${randomUUID()}.${fileExt}`;

            const { data } = await adminSupabase.storage
                .from("portfolio_uploads")
                .upload(videoPath, fileBuffer);

            if (!data?.path) {
                console.error("Video upload missing path");
                continue;
            }

            const { data: url } = adminSupabase.storage
                .from("portfolio_uploads")
                .getPublicUrl(data.path);

            videoAssets.push({
                type: "video",
                url: url.publicUrl,
                title: meta.title ?? "",
                description: meta.description ?? "",
                label: fallbackLabel,
                sectionHint: meta.sectionHint ?? "",
                alt: fallbackAlt,
            });
        }

        // ==============================================================
        // CALL SPRING BOOT — save DB records
        // ==============================================================
        const backendUrl = getBackendUrl();

        const uploadPayload = {
            resumeRawFileUrl: publicResumeUrl,
            assets: [...mediaAssets, ...videoAssets],
            templateId,
            lastStep: "review",
        };

        const res = await fetch(
            `${backendUrl}/api/v1/portfolio/${portfolioId}/uploads`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(uploadPayload),
            },
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Backend saveUploads failed:", res.status, errorText);
            return NextResponse.json(
                { error: "Failed to save upload records." },
                { status: res.status },
            );
        }

        const result = await res.json();
        return NextResponse.json(result);
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
};
