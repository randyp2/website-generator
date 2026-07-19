import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const GET = async (
    _request: Request,
    context: { params: Promise<{ slug: string }> },
) => {
    const { slug } = await context.params;

    return proxyBackendRequest(
        `/api/v1/public/portfolio/${encodeURIComponent(slug)}/engagement`,
        { optionalAuth: true },
    );
};
