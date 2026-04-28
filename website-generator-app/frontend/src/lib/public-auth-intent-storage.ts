import type {
    AuthIntent,
    AuthModalReason,
} from "@/context/PublicAuthGateContext";
import type { PriceKey } from "@/types/billing";

const AUTH_INTENT_STORAGE_KEY = "wg.public-auth-intent";
const AUTH_INTENT_TTL_MS = 10 * 60 * 1000;

export const AUTH_NEXT_PATH_COOKIE = "wg_auth_next_path";
const AUTH_NEXT_PATH_COOKIE_TTL_SECONDS = 10 * 60;

const writeNextPathCookie = (nextPath: string): void => {
    if (typeof document === "undefined") {
        return;
    }
    const isSecure = window.location.protocol === "https:";
    const segments = [
        `${AUTH_NEXT_PATH_COOKIE}=${encodeURIComponent(nextPath)}`,
        "Path=/",
        `Max-Age=${AUTH_NEXT_PATH_COOKIE_TTL_SECONDS}`,
        "SameSite=Lax",
    ];
    if (isSecure) {
        segments.push("Secure");
    }
    document.cookie = segments.join("; ");
};

const clearNextPathCookie = (): void => {
    if (typeof document === "undefined") {
        return;
    }
    document.cookie = `${AUTH_NEXT_PATH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
};

type PersistedAuthIntent = AuthIntent & {
    createdAtMs: number;
};

const PRICE_KEY_SET: ReadonlySet<PriceKey> = new Set<PriceKey>([
    "WEBSITE_GENERATOR_PRO_MONTHLY",
    "WEBSITE_GENERATOR_PRO_ANNUAL",
    "CREDIT_PACK_SMALL",
    "CREDIT_PACK_MEDIUM",
    "CREDIT_PACK_LARGE",
]);

const isPriceKey = (value: unknown): value is PriceKey =>
    typeof value === "string" && PRICE_KEY_SET.has(value as PriceKey);

const isPersistedAuthIntent = (value: unknown): value is PersistedAuthIntent => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<PersistedAuthIntent>;

    return (
        candidate.type === "pricing_checkout" &&
        isPriceKey(candidate.priceKey) &&
        typeof candidate.createdAtMs === "number"
    );
};

const readRawIntent = (): PersistedAuthIntent | null => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const rawValue = window.sessionStorage.getItem(AUTH_INTENT_STORAGE_KEY);
        if (!rawValue) {
            return null;
        }

        const parsed = JSON.parse(rawValue) as unknown;
        if (!isPersistedAuthIntent(parsed)) {
            window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
            return null;
        }

        if (Date.now() - parsed.createdAtMs > AUTH_INTENT_TTL_MS) {
            window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
            return null;
        }

        return parsed;
    } catch {
        window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
        return null;
    }
};

export const resolvePostLoginNextPath = (
    reason: AuthModalReason,
    intent: AuthIntent | null,
): string => {
    if (intent?.type === "pricing_checkout" || reason === "pricing") {
        return "/pricing";
    }

    if (typeof window === "undefined") {
        return "/dashboard";
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (
        currentPath.startsWith("/auth") ||
        currentPath.startsWith("/onboarding")
    ) {
        return "/dashboard";
    }

    return currentPath;
};

const nextPathForIntent = (intent: AuthIntent): string | null => {
    if (intent.type === "pricing_checkout") {
        return "/pricing";
    }
    return null;
};

export const persistAuthIntent = (intent: AuthIntent | null): void => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (!intent) {
            window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
            clearNextPathCookie();
            return;
        }

        const payload: PersistedAuthIntent = {
            ...intent,
            createdAtMs: Date.now(),
        };

        window.sessionStorage.setItem(
            AUTH_INTENT_STORAGE_KEY,
            JSON.stringify(payload),
        );

        const nextPath = nextPathForIntent(intent);
        if (nextPath) {
            writeNextPathCookie(nextPath);
        } else {
            clearNextPathCookie();
        }
    } catch {
        // Intentionally ignore storage failures and keep in-memory flow.
    }
};

export const clearPersistedAuthIntent = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
        clearNextPathCookie();
    } catch {
        // Intentionally ignore storage failures.
    }
};

export const consumePersistedAuthIntent = (): AuthIntent | null => {
    const stored = readRawIntent();
    if (!stored) {
        return null;
    }

    clearPersistedAuthIntent();
    return {
        type: stored.type,
        priceKey: stored.priceKey,
    };
};

export const peekPersistedAuthIntent = (): AuthIntent | null => {
    const stored = readRawIntent();
    if (!stored) {
        return null;
    }

    return {
        type: stored.type,
        priceKey: stored.priceKey,
    };
};
