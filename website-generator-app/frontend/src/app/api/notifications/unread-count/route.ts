import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const GET = async () => {
    return proxyBackendRequest(
        "/api/v1/notifications/unread-count",
        {
            authenticated: true,
        },
    );
};
