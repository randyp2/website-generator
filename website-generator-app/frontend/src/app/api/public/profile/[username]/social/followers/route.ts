import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const GET = async (
    request: Request,
    context: { params: Promise<{ username: string }> },
) => {
    const { username } = await context.params;
    const requestUrl = new URL(request.url);
    const page = requestUrl.searchParams.get("page") ?? "0";
    const size = requestUrl.searchParams.get("size") ?? "24";

    return proxyBackendRequest(
        `/api/v1/public/profile/${encodeURIComponent(username)}/social/followers?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
        { optionalAuth: true },
    );
};
