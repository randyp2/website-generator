import { NextResponse } from "next/server";
import { adminSupabase } from "@/utils/supabase/admin";
import { v4 as uuidv4 } from "uuid";
import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { uploadRateLimit } from "@/lib/rate-limit/ratelimit";
import { getClientIp } from "@/lib/rate-limit/utils";

export async function POST(req: Request) {
    const { html } = await req.json();

    if (!html) {
        return NextResponse.json({ error: "Missing HTML" }, { status: 400 });
    }

    // --- Rate limit
    const ip: string = getClientIp(req);
    const rateLimitResponse: NextResponse | null = await enforceRateLimit(
        uploadRateLimit,
        `upload_preview:ip:${ip}`,
    );

    if (rateLimitResponse) return rateLimitResponse;

    const id = uuidv4();
    const filePath = `${id}/index.html`;

    // KEY FIX: Use Buffer, not Blob
    const fileBuffer = Buffer.from(html, "utf8");

    const { error } = await adminSupabase.storage
        .from("anon-previews")
        .upload(filePath, fileBuffer, {
            contentType: "text/html; charset=utf-8", // IMPORTANT
            upsert: true,
        });

    if (error) {
        console.error("UPLOAD ERROR:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data } = adminSupabase.storage
        .from("anon-previews")
        .getPublicUrl(filePath);

    return NextResponse.json({
        success: true,
        url: data.publicUrl,
        id,
    });
}
