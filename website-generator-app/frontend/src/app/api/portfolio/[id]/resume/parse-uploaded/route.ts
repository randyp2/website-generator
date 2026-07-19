import { proxyBackendRequest } from "@/lib/api/backendProxy";

/** Starts parsing from the finalized private storage reference. */
export const POST = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    const { id } = await params;
    const llmFallback = new URL(req.url).searchParams.get("llmFallback");
    const query = llmFallback === null
        ? ""
        : `?llmFallback=${encodeURIComponent(llmFallback)}`;
    return proxyBackendRequest(
        `/api/v1/portfolio/${id}/resume/parse-uploaded${query}`,
        {
            method: "POST",
            authenticated: true,
        },
    );
};
