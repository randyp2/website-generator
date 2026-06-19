import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const POST = async (
    request: Request,
    context: { params: Promise<{ portfolioId: string }> },
) => {
    const { portfolioId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/portfolio/engagement/${encodeURIComponent(portfolioId)}/comments`,
        {
            authenticated: true,
            method: "POST",
            request,
        },
    );
};
