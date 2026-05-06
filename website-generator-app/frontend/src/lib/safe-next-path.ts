const ALLOWED_POST_LOGIN_PATH_PREFIXES: readonly string[] = [
    "/dashboard",
    "/pricing",
    "/explore",
];

export const resolveSafeNextPath = (
    candidate: string | null | undefined,
): string | null => {
    if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
        return null;
    }

    try {
        const parsed = new URL(candidate, "http://localhost");
        const pathname = parsed.pathname;

        const isAllowed = ALLOWED_POST_LOGIN_PATH_PREFIXES.some(
            (prefix) =>
                pathname === prefix || pathname.startsWith(`${prefix}/`),
        );

        if (!isAllowed) {
            return null;
        }

        return `${pathname}${parsed.search}`;
    } catch {
        return null;
    }
};
