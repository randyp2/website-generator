import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const GET = async (
    _request: Request,
    context: { params: Promise<{ username: string }> },
) => {
    const { username } = await context.params;

    return proxyBackendRequest(
        `/api/v1/public/profile/${encodeURIComponent(username)}/social`,
        { optionalAuth: true },
    );
};
