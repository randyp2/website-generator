import { ParsedResumeData, ResumeDTO } from "@/types/resume";
import { adminSupabase } from "@/utils/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type UpdateResumeBody = {
    parsedJson: ParsedResumeData;
    extractedText?: string | null;
};

export const PATCH = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } },
) => {
    const resolvedParams = await Promise.resolve(params);
    const portfolioId = resolvedParams.id;

    // Get JWT token
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session)
        return NextResponse.json(
            { error: "Unauthorized access!" },
            { status: 401 },
        );

    const body = (await req.json()) as UpdateResumeBody | null;

    const backendURL: string =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    const res: Response = await fetch(
        `${backendURL}/api/v1/portfolio/${portfolioId}/resume`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                parsedJson: body?.parsedJson,
                extractedText: body?.extractedText,
            }),
        },
    );

    if (!res.ok) {
        console.error("Backend resume update failed!: ", res.status);
        return NextResponse.json(
            { error: "Failed to update resume" },
            { status: res.status },
        );
    }

    const resume = (await res.json()) as ResumeDTO;
    return NextResponse.json(resume);
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
