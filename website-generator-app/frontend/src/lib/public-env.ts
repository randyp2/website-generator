const trimTrailingSlashes = (url: string): string => url.replace(/\/+$/, "");

export const getPublicBackendUrlOrNull = (): string | null => {
    const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    if (!configured) return null;
    return trimTrailingSlashes(configured);
};
