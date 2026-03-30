import { getBackendUrl } from "@/lib/server-env";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const slug = req.nextUrl.searchParams.get("slug");

    if (!slug) {
        return NextResponse.json({ available: false });
    }

    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/api/v1/public/portfolio/${encodeURIComponent(slug)}/available`);

    if (!res.ok) {
        return NextResponse.json({ available: false });
    }

    const data = await res.json();
    return NextResponse.json(data);
};
