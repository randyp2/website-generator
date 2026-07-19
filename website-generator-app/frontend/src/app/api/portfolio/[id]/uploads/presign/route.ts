import { proxyBackendRequest } from "@/lib/api/backendProxy";

/** Proxies upload-token requests while forwarding both user and internal auth. */
export const POST = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    const { id } = await params;
    return proxyBackendRequest(`/api/v1/portfolio/${id}/uploads/presign`, {
        method: "POST",
        request: req,
        authenticated: true,
    });
};
