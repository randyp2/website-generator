import { getBackendUrl } from "@/lib/server-env";
import { NextResponse } from "next/server";

export const GET = async (
    _req: Request,
    context: { params: Promise<{ username: string }> },
) => {
    try {
        const { username } = await context.params;
        const backendUrl = getBackendUrl();

        const response = await fetch(
            `${backendUrl}/api/v1/public/profile/${encodeURIComponent(username)}/verification/summary`,
            { next: { revalidate: 30 } },
        );

        if (response.status === 404) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 },
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch public verification summary" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error(
            "Error in /api/public/profile/[username]/verification/summary:",
            error,
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
