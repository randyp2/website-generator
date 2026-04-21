const trimTrailingSlashes = (url: string): string => url.replace(/\/+$/, "");

export const getPublicBackendUrlOrNull = (): string | null => {
    const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    if (!configured) return null;
    return trimTrailingSlashes(configured);
};

export const getPublicSiteUrl = (): string => {
    if (typeof window !== "undefined" && window.location?.origin) {
        return trimTrailingSlashes(window.location.origin);
    }
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (configured) return trimTrailingSlashes(configured);
    return "http://localhost:3000";
};

export const buildPortfolioUrl = (slug: string): string =>
    `${getPublicSiteUrl()}/portfolio/${slug}`;
