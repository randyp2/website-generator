import "server-only";

import { getBackendUrl } from "@/lib/server-env";

const INTERNAL_SECRET_HEADER = "X-Internal-Secret";

const resolveBackendPath = (path: string): string => {
    if (!path.startsWith("/")) {
        throw new Error("Backend path must start with '/'");
    }
    return `${getBackendUrl()}${path}`;
};

/**
 * Sends a server-side request to the configured backend and attaches the
 * internal request credential when configured.
 */
export const fetchBackend = (
    path: string,
    init: RequestInit = {},
): Promise<Response> => {
    const headers = new Headers(init.headers);
    const internalSecret = process.env.INTERNAL_API_SECRET?.trim();
    if (internalSecret) {
        headers.set(INTERNAL_SECRET_HEADER, internalSecret);
    }

    return fetch(resolveBackendPath(path), {
        ...init,
        headers,
    });
};
