import { proxyBackendRequest } from "@/lib/api/backendProxy";
import { NextResponse } from "next/server";

const DELETE_CONFIRMATION = "DELETE";

const hasValidConfirmation = async (request: Request): Promise<boolean> => {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return false;
    }

    return (
        (body as Record<string, unknown>).confirmation === DELETE_CONFIRMATION
    );
};

/** Proxies a confirmed account-deletion request for the current user. */
export const DELETE = async (request: Request): Promise<NextResponse> => {
    if (!(await hasValidConfirmation(request))) {
        return NextResponse.json(
            { error: `Type ${DELETE_CONFIRMATION} to confirm account deletion.` },
            { status: 400 },
        );
    }

    const proxyRequest = new Request(request.url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: DELETE_CONFIRMATION }),
    });

    return proxyBackendRequest("/api/v1/account", {
        method: "DELETE",
        request: proxyRequest,
        authenticated: true,
    });
};
