import { proxyBackendRequest } from "@/lib/api/backendProxy";
import { NextResponse } from "next/server";

const MAX_URL_LENGTH = 2048;
const BACKEND_PATH = "/api/v1/portfolio/site-verifications";

const readExternalUrl = async (request: Request): Promise<string | null> => {
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;

    const externalUrl = (body as Record<string, unknown>).externalUrl;
    if (typeof externalUrl !== "string" || externalUrl.trim().length === 0) {
        return null;
    }
    return externalUrl.trim();
};

/**
 * Proxies authenticated ownership-challenge requests to the backend.
 */
export const POST = async (request: Request): Promise<NextResponse> => {
    const externalUrl = await readExternalUrl(request);
    if (!externalUrl) {
        return NextResponse.json(
            { error: "externalUrl is required" },
            { status: 400 },
        );
    }
    if (externalUrl.length > MAX_URL_LENGTH) {
        return NextResponse.json(
            { error: `externalUrl must be at most ${MAX_URL_LENGTH} characters` },
            { status: 400 },
        );
    }

    const proxyRequest = new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalUrl }),
    });
    return proxyBackendRequest(BACKEND_PATH, {
        method: "POST",
        request: proxyRequest,
        authenticated: true,
    });
};
