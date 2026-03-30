import { getBackendUrl } from "@/lib/server-env";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) => {
    const { slug } = await params;
    const backendUrl = getBackendUrl();

    const res = await fetch(
        `${backendUrl}/api/v1/public/portfolio/${encodeURIComponent(slug)}/html`,
        { next: { revalidate: 60 } },
    );

    if (!res.ok) {
        return new NextResponse("Not found", { status: 404 });
    }

    const html = await res.text();
    return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
};
