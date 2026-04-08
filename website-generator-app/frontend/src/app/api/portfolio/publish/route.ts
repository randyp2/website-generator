import { getBackendUrl } from "@/lib/server-env";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const backendUrl = getBackendUrl();

    const res: Response = await fetch(`${backendUrl}/api/v1/portfolio/publish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            portfolioId:
                typeof body?.portfolioId === "string" ? body.portfolioId : null,
            sourceType:
                typeof body?.sourceType === "string" ? body.sourceType : null,
            title: typeof body?.title === "string" ? body.title : null,
            externalUrl:
                typeof body?.externalUrl === "string" ? body.externalUrl : null,
            slug: typeof body?.slug === "string" ? body.slug : null,
            description:
                typeof body?.description === "string" ? body.description : null,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
            { error: errorText || "Failed to publish portfolio" },
            { status: res.status },
        );
    }

    return NextResponse.json(await res.json());
};
