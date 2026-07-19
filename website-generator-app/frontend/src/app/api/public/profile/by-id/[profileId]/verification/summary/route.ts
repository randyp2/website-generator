import { getBackendUrl } from "@/lib/server-env";
import { NextResponse } from "next/server";

export const GET = async (
    _req: Request,
    context: { params: Promise<{ profileId: string }> },
) => {
    try {
        const { profileId } = await context.params;
        const backendUrl = getBackendUrl();

        const response = await fetch(
            `${backendUrl}/api/v1/public/profile/by-id/${encodeURIComponent(profileId)}/verification/summary`,
            { cache: "no-store" },
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
            "Error in /api/public/profile/by-id/[profileId]/verification/summary:",
            error,
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
};
