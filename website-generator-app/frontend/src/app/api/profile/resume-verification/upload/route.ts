import { enforceRateLimit } from "@/lib/rate-limit/enable-rate-limit";
import { uploadRateLimit } from "@/lib/rate-limit/ratelimit";
import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("file");

    if (!(resumeFile instanceof File)) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await enforceRateLimit(
      uploadRateLimit,
      `upload_profile_resume_verification:user:${user.id}`,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", resumeFile);

    const backendUrl = getBackendUrl();
    const response = await fetch(
      `${backendUrl}/api/v1/profile/resume-verification/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: backendFormData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Backend profile resume verification upload failed:",
        response.status,
        errorText,
      );
      return NextResponse.json(
        { error: "Failed to upload resume for verification" },
        { status: response.status },
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error in profile resume verification upload route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
