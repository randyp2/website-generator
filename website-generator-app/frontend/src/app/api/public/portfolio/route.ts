import { getBackendUrl } from "@/lib/server-env";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const { searchParams } = req.nextUrl;
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "12";

    const backendUrl = getBackendUrl();
    const res = await fetch(
        `${backendUrl}/api/v1/public/portfolio?page=${page}&size=${size}`,
        { next: { revalidate: 5 } },
    );

    if (!res.ok) {
        return NextResponse.json(
            { content: [], totalPages: 0, last: true },
            { status: 500 },
        );
    }

    return NextResponse.json(await res.json());
};
