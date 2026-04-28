import type {
    AuthIntent,
    AuthModalReason,
} from "@/context/PublicAuthGateContext";
import type { PriceKey } from "@/types/billing";

const AUTH_INTENT_STORAGE_KEY = "wg.public-auth-intent";
const AUTH_INTENT_TTL_MS = 10 * 60 * 1000;

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

export const persistAuthIntent = (intent: AuthIntent | null): void => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (!intent) {
            window.sessionStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
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
