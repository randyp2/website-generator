const trimTrailingSlashes = (url: string): string => url.replace(/\/+$/, "");
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;

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

export const toDecorativeProfileSegment = (value?: string | null): string => {
    const normalized = (value ?? "")
        .toLowerCase()
        .trim()
        .replace(NON_ALPHANUMERIC, "-")
        .replace(EDGE_DASHES, "");
    return normalized || "portfolio";
};

const normalizeSlugSegment = (slug: string): string => {
    const normalized = slug.trim();
    return normalized || "portfolio";
};

export const buildPortfolioPath = (
    slug: string,
    profile?: string | null,
): string => {
    const profileSegment = toDecorativeProfileSegment(profile);
    const slugSegment = normalizeSlugSegment(slug);
    return `/${encodeURIComponent(profileSegment)}/${encodeURIComponent(slugSegment)}`;
};

export const buildPortfolioUrl = (
    slug: string,
    profile?: string | null,
): string => `${getPublicSiteUrl()}${buildPortfolioPath(slug, profile)}`;
