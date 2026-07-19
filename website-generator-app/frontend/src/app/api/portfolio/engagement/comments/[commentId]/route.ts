import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const PATCH = async (
    request: Request,
    context: { params: Promise<{ commentId: string }> },
) => {
    const { commentId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/portfolio/engagement/comments/${encodeURIComponent(commentId)}`,
        {
            authenticated: true,
            method: "PATCH",
            request,
        },
    );
};

export const DELETE = async (
    _request: Request,
    context: { params: Promise<{ commentId: string }> },
) => {
    const { commentId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/portfolio/engagement/comments/${encodeURIComponent(commentId)}`,
        {
            authenticated: true,
            method: "DELETE",
        },
    );
};
