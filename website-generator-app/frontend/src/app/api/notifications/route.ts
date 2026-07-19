import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const GET = async (request: Request) => {
    const requestUrl = new URL(request.url);

    return proxyBackendRequest(
        `/api/v1/notifications${requestUrl.search}`,
        {
            authenticated: true,
        },
    );
};
