import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { uploadRateLimit } from "@/lib/rate-limit/ratelimit";
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

export async function POST(req: Request) {
    // --- Get user id ---
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError)
        return NextResponse.json(
            { error: "Failed to create portfolio." },
            { status: 500 },
        );

    // --- Enforce rate limiting ---
    const rateLimitKey: string = `upload_portfolio:user:${user.id}`;
    const rateLimitResponse: NextResponse | null = await enforceRateLimit(
        uploadRateLimit,
        rateLimitKey,
    );

    if (rateLimitResponse) return rateLimitResponse;

    // --- Parse request body ---
    try {
        const formData = await req.formData();

        const templateId = formData.get("templateId") as string;

        const resumeFile = formData.get("resumeFile");
        const mediaFiles = formData.getAll("mediaFiles");
        const videoFiles = formData.getAll("videoFiles");
        const mediaMeta = parseMeta(formData.get("mediaMeta"));
        const videoMeta = parseMeta(formData.get("videoMeta"));

        if (!user || !templateId) {
            return NextResponse.json(
                { error: "userId and templateId are required." },
                { status: 400 },
            );
        }

        const userId = user.id;

        // ==============================================================
        // UPLOAD PORTFOLIO
        // ==============================================================

        // Insert row and return the row in portfolioRow
        const { data: portfolioRow, error: portfolioError } =
            await adminSupabase
                .from("portfolios")
                .insert({
                    title: "Untitled Portfolio",
                    user_id: userId,
                    template_id: templateId,
                    status: "draft",
                })
                .select()
                .single();

        if (portfolioError) {
            console.error("Portfolio creation error:", portfolioError);
            return NextResponse.json(
                { error: "Failed to create portfolio." },
                { status: 500 },
            );
        }

        const portfolioId = portfolioRow.id;

        // ==============================================================
        // UPLOAD RESUME
        // ==============================================================

        // --- Resume File ---
        // Validate portfolio ID
        if (!portfolioId) {
            return NextResponse.json(
                { error: "portfolioId is required." },
                { status: 400 },
            );
        }

        // Validate file presence
        if (!(resumeFile instanceof File)) {
            return NextResponse.json(
                { error: "No file provided." },
                { status: 400 },
            );
        }

        // Validate file type
        const ext = resumeFile.name.split(".").pop()?.toLowerCase();
        if (!["pdf", "docx"].includes(ext || "")) {
            return NextResponse.json(
                { error: "Invalid file type. Only PDF and DOCX allowed." },
                { status: 400 },
            );
        }

        // Convert file to buffer
        const bytes = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique file path within storage bucket
        const storagePath = `resumes/${portfolioId}/${randomUUID()}.${ext}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } =
            await adminSupabase.storage
                .from("portfolio_uploads")
                .upload(storagePath, buffer, {
                    contentType: resumeFile.type,
                    upsert: false,
                });

        // Validate upload success
        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json(
                { error: "Failed to upload file to storage." },
                { status: 500 },
            );
        }

        /* ======== UPLOAD TO RESUME TABLE ========  */

        // Public URL for the uploaded resume
        const { data: publicUrl } = adminSupabase.storage
            .from("portfolio_uploads")
            .getPublicUrl(uploadData.path);

        // Insert into Supabase "resumes" table
        const { data: resumeRecord, error: insertError } = await adminSupabase
            .from("resumes")
            .insert({
                portfolio_id: portfolioId,
                raw_file_url: publicUrl.publicUrl,
                extracted_text: null, // parsed later by Spring Boot
                parsed_json: null, // parsed later by Spring Boot
            })
            .select()
            .single();

        // Validate DB insert success
        if (insertError) {
            console.error("DB insert error:", insertError);
            return NextResponse.json(
                { error: "Failed to save resume record." },
                { status: 500 },
            );
        }

        // ==============================================================
        // UPLOAD MEDIA FILES
        // ==============================================================
        for (let index = 0; index < mediaFiles.length; index += 1) {
            const fileItem = mediaFiles[index];
            if (!(fileItem instanceof File)) continue;

            const meta = mediaMeta[index] ?? {};
            const fallbackName = meta.name ?? fileItem.name ?? "";
            const fallbackLabel = meta.title || meta.label || fallbackName;
            const fallbackAlt =
                meta.alt || meta.description || meta.title || fallbackName;
            const ext = fileItem.name.split(".").pop();
            const buffer = Buffer.from(await fileItem.arrayBuffer());

            const mediaPath = `media/${portfolioId}/${randomUUID()}.${ext}`;

            const { data } = await adminSupabase.storage
                .from("portfolio_uploads")
                .upload(mediaPath, buffer);

            const { data: url } = adminSupabase.storage
                .from("portfolio_uploads")
                .getPublicUrl(data?.path ?? "");

            // Insert into assets table
            await adminSupabase.from("assets").insert({
                portfolio_id: portfolioId,
                file_type: "image",
                file_url: url.publicUrl,
                title: meta.title ?? "",
                description: meta.description ?? "",
                label: fallbackLabel,
                section_hint: meta.sectionHint ?? "",
                alt: fallbackAlt,
            });
        }

        // ==============================================================
        // UPLOAD VIDEO FILES (optional)
        // ==============================================================

        for (let index = 0; index < videoFiles.length; index += 1) {
            const fileItem = videoFiles[index];
            if (!(fileItem instanceof File)) continue;

            const meta = videoMeta[index] ?? {};
            const fallbackName = meta.name ?? fileItem.name ?? "";
            const fallbackLabel = meta.title || meta.label || fallbackName;
            const fallbackAlt =
                meta.alt || meta.description || meta.title || fallbackName;
            const ext = fileItem.name.split(".").pop();
            const buffer = Buffer.from(await fileItem.arrayBuffer());

            const videoPath = `videos/${portfolioId}/${randomUUID()}.${ext}`;

            const { data } = await adminSupabase.storage
                .from("portfolio_uploads")
                .upload(videoPath, buffer);

            if (!data?.path) {
                console.error("Video upload missing path");
                continue;
            }

            const { data: url } = adminSupabase.storage
                .from("portfolio_uploads")
                .getPublicUrl(data.path);

            // Insert into assets table
            await adminSupabase.from("assets").insert({
                portfolio_id: portfolioId,
                file_type: "video",
                file_url: url.publicUrl,
                title: meta.title ?? "",
                description: meta.description ?? "",
                label: fallbackLabel,
                section_hint: meta.sectionHint ?? "",
                alt: fallbackAlt,
            });
        }

        // Return success
        return NextResponse.json({
            portfolio: portfolioRow,
            resume: resumeRecord,
            assetsUploaded: mediaFiles.length + videoFiles.length,
        });
    } catch (err) {
        // Handle unexpected errors
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
}
