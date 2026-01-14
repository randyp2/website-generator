import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { FALLBACK_STYLE_OPTIONS } from "@/types/style";

/**
 * Next.js API Route: Style Suggestions
 *
 * This route forwards style suggestion requests to the Spring Boot backend.
 * The backend will use OpenAI to generate personalized style suggestions.
 *
 * Flow:
 * 1. Frontend calls this Next.js route
 * 2. This route forwards to Spring Boot: POST /api/portfolio/style-suggestions
 * 3. Spring Boot uses OpenAI to generate suggestions
 * 4. Response is returned to frontend
 */
export async function POST(req: Request) {
  try {
    const { templateId, resume } = await req.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "templateId is required" },
        { status: 400 }
      );
    }

    // Get user JWT for backend authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = session.access_token;

    // Get backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL not configured, using fallback options");
      return NextResponse.json({
        success: true,
        suggestions: FALLBACK_STYLE_OPTIONS,
        fallbackUsed: true,
      });
    }

    // TODO: Implement Spring Boot endpoint
    // Expected endpoint: POST ${backendUrl}/api/portfolio/style-suggestions
    //
    // Request body:
    // {
    //   templateId: string,
    //   resume: ParsedResumeData | null  // May be null if user hasn't uploaded resume yet
    // }
    //
    // Expected response:
    // {
    //   success: boolean,
    //   suggestions: {
    //     colorScheme: string[],
    //     layoutDensity: string[],
    //     tone: string[],
    //     visualStyle: string[],
    //     sectionEmphasis: string[]
    //   },
    //   fallbackUsed: boolean
    // }

    try {
      // Call Spring Boot backend
      const response = await fetch(`${backendUrl}/api/portfolio/style-suggestions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          resume,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      return NextResponse.json({
        success: true,
        suggestions: data.suggestions,
        fallbackUsed: data.fallbackUsed || false,
      });

    } catch (backendError) {
      console.error("Backend call failed, using fallback options:", backendError);

      // Fallback to hardcoded options if backend is not available
      return NextResponse.json({
        success: true,
        suggestions: FALLBACK_STYLE_OPTIONS,
        fallbackUsed: true,
      });
    }

  } catch (error) {
    console.error("Style suggestions API error:", error);

    // Final fallback
    return NextResponse.json({
      success: true,
      suggestions: FALLBACK_STYLE_OPTIONS,
      fallbackUsed: true,
    });
  }
}
