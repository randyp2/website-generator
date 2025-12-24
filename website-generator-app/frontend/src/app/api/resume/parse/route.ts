import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * API route to parse uploaded resume files
 * This acts as a proxy to your Java backend's ResumeController
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("file") as File;

    if (!resumeFile) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    // Extract user JWT
    const supabase = await createServerSupabaseClient();

    const {
        data : { session },
        error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }

    const token = session.access_token;

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    // Call backend endpoint 
    const backendFormData = new FormData();
    backendFormData.append("file", resumeFile);

    const response = await fetch(`${BACKEND_URL}/api/resume/parse`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend parsing error:", errorText);
      return NextResponse.json(
        { error: "Failed to parse resume" },
        { status: response.status }
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
      { status: 500 }
    );
  }
}
