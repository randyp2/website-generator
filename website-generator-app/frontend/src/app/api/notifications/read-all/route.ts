import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const PATCH = async () => {
    return proxyBackendRequest(
        "/api/v1/notifications/read-all",
        {
            authenticated: true,
            method: "PATCH",
        },
    );
};
