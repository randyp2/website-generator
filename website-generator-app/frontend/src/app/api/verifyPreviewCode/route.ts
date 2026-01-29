export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { adminSupabase } from "@/utils/supabase/admin";
import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { cheapRateLimit } from "@/lib/rate-limit/ratelimit";
import { getClientIp } from "@/lib/rate-limit/utils";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/verifyPreviewCode
 *
 * This route:
 *  1. Receives (email, code) from the frontend
 *  2. Checks if the verification table has a matching row
 *  3. If valid → extracts the preview URL
 *  4. Deletes the verification row (prevent reuse)
 *  5. Emails the user their final generated website link
 *  6. Returns success to the frontend
 *
 * @param req Request containing { email: string, code: string }
 * @returns NextResponse with success or error message
 */
export async function POST(req: Request) {
    // Parse JSON body sent from frontend
    const body = await req.json();
    const { email, code } = body;

    // Valdate fields
    if (!email || !code) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // --- Normalize input
    const normalizedEmail: string = email.toLowerCase().trim();

    // --- Enforce rate limit by email
    const emailRateLimitKey: string = `verify_preview_code:email:${normalizedEmail}`;
    const emailRateLimitResponse: NextResponse | null = await enforceRateLimit(
        cheapRateLimit,
        emailRateLimitKey,
    );

    if (emailRateLimitResponse) return emailRateLimitResponse;

    // --- Enforce rate limit by ip
    const ip: string = getClientIp(req);
    const ipRateLimitResponse: NextResponse | null = await enforceRateLimit(
        cheapRateLimit,
        `verify_preview_code:ip:${ip}`,
    );

    if (ipRateLimitResponse) return ipRateLimitResponse;

    //
    /**
     * We now look for a row in the email_verifications table that matches:
     *
     * (A) the email the user typed in
     * (B) the 6-digit code they entered
     *
     * .order("created_at") use the most recent one if multiple codes exist
     */
    const { data, error } = await adminSupabase
        .from("email_verifications")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("code", code)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const { preview_file_content, preview_file_name } = data;

    try {
        // Send final email with preview URL
        // Send HTML file as attachment
        await resend.emails.send({
            from: "WebGen AI <noreply@portfoliogenai.com>",
            to: normalizedEmail,
            subject: "Your WebGen Portfolio Download",
            html: `
      <div style="font-family: Arial; padding: 20px">
        <h2>Your Portfolio is Ready</h2>
        <p>Your downloadable website is attached as an HTML file.</p>
      </div>
    `,
            attachments: [
                {
                    filename: preview_file_name,
                    content: Buffer.from(preview_file_content, "utf-8"), // <-- CORRECT
                },
            ],
        });

        // Delete after use
        await adminSupabase
            .from("email_verifications")
            .delete()
            .eq("id", data.id);
    } catch {
        return NextResponse.json(
            { error: "Failed to send to email" },
            { status: 500 },
        );
    }

    return NextResponse.json({ success: true });
}
