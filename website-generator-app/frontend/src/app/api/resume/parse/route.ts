import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { expensiveRateLimit } from "@/lib/rate-limit/ratelimit";
import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * API route to parse uploaded resume files
 * This acts as a proxy to your Java backend's ResumeController
 */
export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const llmFallback = searchParams.get("llmFallback");

        const formData = await req.formData();
        const resumeFile = formData.get("file") as File;

        if (!resumeFile) {
            return NextResponse.json(
                { error: "No resume file provided" },
                { status: 400 },
            );
        }

        // --- Verify user
        const supabase = await createServerSupabaseClient();

        // Use getUser() to verify authenticity with Supabase Auth server
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Extract user JWT
        const {
            data: { session },
            error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // --- Enfroce rate limiting
        const rateLimitKey: string = `parse:user:${user.id}`;
        const rateLimitResponse: NextResponse | null = await enforceRateLimit(
            expensiveRateLimit,
            rateLimitKey,
        );

        if (rateLimitResponse) return rateLimitResponse;

        const token = session.access_token;

        const backendUrl = getBackendUrl();

        // Call backend endpoint
        const backendFormData = new FormData();
        backendFormData.append("file", resumeFile);

        const parseUrl = llmFallback !== null
            ? `${backendUrl}/api/v1/resume/parse?llmFallback=${llmFallback}`
            : `${backendUrl}/api/v1/resume/parse`;

        const response = await fetch(parseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: backendFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend parsing error:", errorText);
            return NextResponse.json(
                { error: "Failed to parse resume" },
                { status: response.status },
            );
        }

        const parsedData = await response.json();

        return NextResponse.json({
            success: true,
            data: parsedData,
        });
    } catch (error) {
        console.error("Error in resume parse route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
