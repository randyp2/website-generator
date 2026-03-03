import "server-only";

const DEFAULT_BACKEND_URL = "http://localhost:8080";

const normalizeUrl = (url: string): string => url.replace(/\/+$/, "");
const resolveConfiguredBackendUrl = (): string | null => {
    const serverConfigured = process.env.BACKEND_URL?.trim();
    if (serverConfigured) return serverConfigured;

    const publicConfigured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    if (publicConfigured) return publicConfigured;

    return null;
};

export const getBackendUrl = (): string => {
    const configured = resolveConfiguredBackendUrl();
    if (!configured) return DEFAULT_BACKEND_URL;
    return normalizeUrl(configured);
};

export const getBackendUrlOrNull = (): string | null => {
    const configured = resolveConfiguredBackendUrl();
    if (!configured) return null;
    return normalizeUrl(configured);
};
