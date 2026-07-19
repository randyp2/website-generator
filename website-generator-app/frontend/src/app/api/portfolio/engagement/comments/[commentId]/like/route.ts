import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const POST = async (
    _request: Request,
    context: { params: Promise<{ commentId: string }> },
) => {
    const { commentId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/portfolio/engagement/comments/${encodeURIComponent(commentId)}/like`,
        {
            authenticated: true,
            method: "POST",
        },
    );
};

export const DELETE = async (
    _request: Request,
    context: { params: Promise<{ commentId: string }> },
) => {
    const { commentId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/portfolio/engagement/comments/${encodeURIComponent(commentId)}/like`,
        {
            authenticated: true,
            method: "DELETE",
        },
    );
};
