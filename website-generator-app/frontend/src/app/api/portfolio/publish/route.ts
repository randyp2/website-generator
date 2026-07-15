import { proxyBackendRequest } from "@/lib/api/backendProxy";

export const POST = async (req: Request) => {
    const body = await req.json().catch(() => ({}));
    const proxyRequest = new Request(req.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            portfolioId:
                typeof body?.portfolioId === "string" ? body.portfolioId : null,
            sourceType:
                typeof body?.sourceType === "string" ? body.sourceType : null,
            title: typeof body?.title === "string" ? body.title : null,
            externalUrl:
                typeof body?.externalUrl === "string" ? body.externalUrl : null,
            siteVerificationId:
                typeof body?.siteVerificationId === "string"
                    ? body.siteVerificationId
                    : null,
            slug: typeof body?.slug === "string" ? body.slug : null,
            description:
                typeof body?.description === "string" ? body.description : null,
        }),
    });

    return proxyBackendRequest("/api/v1/portfolio/publish", {
        method: "POST",
        request: proxyRequest,
        authenticated: true,
    });
};
