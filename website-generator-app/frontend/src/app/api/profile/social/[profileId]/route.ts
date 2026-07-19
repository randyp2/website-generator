import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const GET = async (
    _request: Request,
    context: { params: Promise<{ profileId: string }> },
) => {
    const { profileId } = await context.params;

    return proxyBackendRequest(
        `/api/v1/profile/social/${encodeURIComponent(profileId)}`,
        { authenticated: true },
    );
};
