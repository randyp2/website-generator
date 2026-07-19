import { proxyBackendRequest } from "@/lib/api/backendProxy";

type RouteContext = { params: Promise<{ id: string }> };

const proxyPreviewRequest = async (
    method: "GET" | "POST",
    context: RouteContext,
) => {
    const { id: portfolioId } = await context.params;
    return proxyBackendRequest(
        `/api/v1/portfolio/${portfolioId}/preview-screenshot`,
        { method, authenticated: true },
    );
};

export const POST = async (_request: Request, context: RouteContext) =>
    proxyPreviewRequest("POST", context);

export const GET = async (_request: Request, context: RouteContext) =>
    proxyPreviewRequest("GET", context);
