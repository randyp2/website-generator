import { getBackendUrl } from "@/lib/server-env";
import { ParsedResumeData, ResumeDTO } from "@/types/resume";
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

    const backendURL = getBackendUrl();

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
    const resolvedParams = await Promise.resolve(params);
    const portfolioId = resolvedParams.id;

    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized access!" }, { status: 401 });

    const backendURL = getBackendUrl();
    const res = await fetch(
        `${backendURL}/api/v1/portfolio/${portfolioId}/resume`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${session.access_token}` },
        },
    );

    if (!res.ok) {
        console.error("Backend resume GET failed:", res.status);
        return NextResponse.json({ error: "Failed to load resume" }, { status: res.status });
    }

    const resume = await res.json();
    return NextResponse.json({
        parsedJson: resume?.parsedJson ?? null,
        extractedText: resume?.extractedText ?? null,
    });
};
