import { fetchBackend } from "@/lib/api/backendFetch";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const username = req.nextUrl.searchParams.get("username") ?? "";

        const response = await fetchBackend(
            `/api/v1/public/profile/username-available?username=${encodeURIComponent(username)}`,
            { next: { revalidate: 5 } },
        );

        if (!response.ok) {
            return NextResponse.json(
                { username, available: false, reason: "error" },
                { status: response.status },
            );
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error in /api/public/profile/username-available:", error);
        return NextResponse.json(
            { username: null, available: false, reason: "error" },
            { status: 500 },
        );
    }
};
