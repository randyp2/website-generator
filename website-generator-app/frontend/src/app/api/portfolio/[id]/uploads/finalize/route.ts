import { proxyBackendRequest } from "@/lib/api/backendProxy";

/** Finalizes storage references without accepting any file bytes. */
export const POST = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    const { id } = await params;
    return proxyBackendRequest(`/api/v1/portfolio/${id}/uploads`, {
        method: "POST",
        request: req,
        authenticated: true,
    });
};
