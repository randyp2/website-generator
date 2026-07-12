/**
 * Next.js instrumentation hook — runs once when the server process starts.
 *
 * Attaches the shared internal secret (X-Internal-Secret) to every server-side
 * fetch that targets our Spring backend, so the backend can verify the request
 * came from this Next.js server rather than the public internet. Centralizing
 * it here means all ~60 proxy route handlers are covered without touching each
 * one, and any future backend call is protected automatically.
 *
 * Only requests to the backend host are modified; calls to Supabase, Stripe,
 * OpenAI, R2, etc. pass through untouched. Dormant when the secret is unset.
 */
export async function register(): Promise<void> {
    // Route handlers run in the Node.js runtime; skip edge/other runtimes.
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const secret = process.env.INTERNAL_API_SECRET?.trim();
    // No secret configured → do nothing, exactly like the backend filter's
    // dormant state, so this can ship before the secret is provisioned.
    if (!secret) return;

    const backendUrl = (
        process.env.BACKEND_URL?.trim() ||
        process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
        "http://localhost:8080"
    ).replace(/\/+$/, "");

    const originalFetch = globalThis.fetch;

    const targetsBackend = (input: RequestInfo | URL): boolean => {
        const url =
            typeof input === "string"
                ? input
                : input instanceof URL
                  ? input.href
                  : input.url;
        return url.startsWith(backendUrl);
    };

    globalThis.fetch = (input, init) => {
        if (!targetsBackend(input)) {
            return originalFetch(input, init);
        }

        // Merge onto any caller-provided headers (Authorization, Content-Type…).
        const headers = new Headers(init?.headers);
        headers.set("X-Internal-Secret", secret);
        return originalFetch(input, { ...init, headers });
    };
}
