import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const PATCH = async (
    _request: Request,
    context: { params: Promise<{ notificationId: string }> },
) => {
    const { notificationId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
        {
            authenticated: true,
            method: "PATCH",
        },
    );
};
