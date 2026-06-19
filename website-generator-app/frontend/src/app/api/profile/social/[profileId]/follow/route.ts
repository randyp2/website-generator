import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const POST = async (
    _request: Request,
    context: { params: Promise<{ profileId: string }> },
) => {
    const { profileId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/profile/social/${encodeURIComponent(profileId)}/follow`,
        {
            authenticated: true,
            method: "POST",
        },
    );
};

export const DELETE = async (
    _request: Request,
    context: { params: Promise<{ profileId: string }> },
) => {
    const { profileId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/profile/social/${encodeURIComponent(profileId)}/follow`,
        {
            authenticated: true,
            method: "DELETE",
        },
    );
};
