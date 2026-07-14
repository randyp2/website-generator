import { NextResponse } from "next/server";

import { proxyBackendRequest } from "@/lib/api/backendProxy";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Proxies authenticated ownership checks to the backend verifier. */
export const POST = async (
    _request: Request,
    context: { params: Promise<{ verificationId: string }> },
): Promise<NextResponse> => {
    const { verificationId } = await context.params;
    if (!UUID_PATTERN.test(verificationId)) {
        return NextResponse.json(
            { error: "verificationId must be a valid UUID" },
            { status: 400 },
        );
    }

    return proxyBackendRequest(
        `/api/v1/portfolio/site-verifications/${encodeURIComponent(verificationId)}/verify`,
        {
            method: "POST",
            authenticated: true,
        },
    );
};
