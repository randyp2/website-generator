import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const POST = async (
    _request: Request,
    context: { params: Promise<{ portfolioId: string }> },
) => {
    const { portfolioId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/portfolio/engagement/${encodeURIComponent(portfolioId)}/like`,
        {
            authenticated: true,
            method: "POST",
        },
    );
};

export const DELETE = async (
    _request: Request,
    context: { params: Promise<{ portfolioId: string }> },
) => {
    const { portfolioId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/portfolio/engagement/${encodeURIComponent(portfolioId)}/like`,
        {
            authenticated: true,
            method: "DELETE",
        },
    );
};
