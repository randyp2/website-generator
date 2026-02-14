import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type ResumeUpdateBody = {
    parsedJson?: unknown;
    extractedText?: string | null;
};

export const PATCH = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } },
) => {
    try {
        // Await params if it's a Promise (Next.js 15+)
        const resolvedParams = await Promise.resolve(params);
        const portfolioId = resolvedParams.id;

        const supabase = await createServerSupabaseClient();

        // --- Validate user auth
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json(
                { error: "Unauthorized access! " },
                { status: 401 },
            );
        }

        // --- Retrieve portfolio (use adminSupabase to bypass RLS)
        const { data: portfolio } = await adminSupabase
            .from("portfolios")
            .select("id, user_id")
            .eq("id", portfolioId)
            .single();

        if (!portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 },
            );
        }

        // Verify ownership
        if (portfolio.user_id !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this portfolio" },
                { status: 403 },
            );
        }

        // --- Parse body
        const body = (await req.json()) as ResumeUpdateBody | null;
        const parsedJson = body?.parsedJson;
        const extractedText =
            typeof body?.extractedText === "string" || body?.extractedText === null
                ? body.extractedText
                : undefined;

        if (!parsedJson) {
            return NextResponse.json(
                { error: "Parsed resume data required!" },
                { status: 400 },
            );
        }

        // Update resume row (use adminSupabase to bypass RLS)
        const { error: resumeError } = await adminSupabase
            .from("resumes")
            .update({
                parsed_json: parsedJson,
                extracted_text: extractedText ?? null,
            })
            .eq("portfolio_id", portfolioId);

        if (resumeError) {
            console.error("Resume update failed:", resumeError);
            return NextResponse.json(
                { error: "Failed to update resume" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        // Handle unexpected errors
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
};

export const GET = async (
    _req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } },
) => {
    try {
        const resolvedParams = await Promise.resolve(params);
        const portfolioId = resolvedParams.id;

        const supabase = await createServerSupabaseClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json(
                { error: "Unauthorized access! " },
                { status: 401 },
            );
        }

        const { data: portfolio } = await adminSupabase
            .from("portfolios")
            .select("id, user_id")
            .eq("id", portfolioId)
            .single();

        if (!portfolio) {
            return NextResponse.json(
                { error: "Portfolio not found" },
                { status: 404 },
            );
        }

        if (portfolio.user_id !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this portfolio" },
                { status: 403 },
            );
        }

        const { data: resume, error: resumeError } = await adminSupabase
            .from("resumes")
            .select("parsed_json, extracted_text")
            .eq("portfolio_id", portfolioId)
            .single();

        if (resumeError) {
            console.error("Resume load failed:", resumeError);
            return NextResponse.json(
                { error: "Failed to load resume" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            parsedJson: resume?.parsed_json ?? null,
            extractedText: resume?.extracted_text ?? null,
        });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 },
        );
    }
};
