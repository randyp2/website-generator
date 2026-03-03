import "server-only";

const DEFAULT_BACKEND_URL = "http://localhost:8080";

const normalizeUrl = (url: string): string => url.replace(/\/+$/, "");

export const getBackendUrl = (): string => {
    const configured = process.env.BACKEND_URL?.trim();
    if (!configured) return DEFAULT_BACKEND_URL;
    return normalizeUrl(configured);
};

export const getBackendUrlOrNull = (): string | null => {
    const configured = process.env.BACKEND_URL?.trim();
    if (!configured) return null;
    return normalizeUrl(configured);
};
