import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const getStringOrUndefined = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;

export const GET = async () => {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch profile" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in /api/profile/me GET:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};

export const PATCH = async (req: Request) => {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rawBody =
            ((await req.json().catch(() => ({}))) as Record<string, unknown>) ?? {};

        const payload = {
            username: getStringOrUndefined(rawBody.username),
            fullName: getStringOrUndefined(rawBody.fullName ?? rawBody.full_name),
            avatarUrl: getStringOrUndefined(rawBody.avatarUrl ?? rawBody.avatar_url),
            bio: getStringOrUndefined(rawBody.bio),
            bannerUrl: getStringOrUndefined(rawBody.bannerUrl ?? rawBody.banner_url),
            location: getStringOrUndefined(rawBody.location),
            school: getStringOrUndefined(rawBody.school),
            degree: getStringOrUndefined(rawBody.degree),
            jobTitle: getStringOrUndefined(rawBody.jobTitle ?? rawBody.job_title),
            company: getStringOrUndefined(rawBody.company),
            websiteUrl: getStringOrUndefined(rawBody.websiteUrl ?? rawBody.website_url),
            linkedinUrl: getStringOrUndefined(rawBody.linkedinUrl ?? rawBody.linkedin_url),
            githubUrl: getStringOrUndefined(rawBody.githubUrl ?? rawBody.github_url),
        };

        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/v1/profile/me`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const message = await response.text();
            return NextResponse.json(
                { error: message || "Failed to update profile" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in /api/profile/me PATCH:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
