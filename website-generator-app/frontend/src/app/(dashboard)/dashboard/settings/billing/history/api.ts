import type {
    BillingCreditPurchaseApiItem,
    BillingHistoryItem,
    BillingInvoiceApiItem,
} from "./types";
import {
    normalizeCreditPurchase,
    normalizeInvoice,
    sortHistoryByRecency,
} from "./helpers";

interface FetchBillingHistoryOptions {
    limit?: number;
}

const toBillingUrl = (
    resource: "invoices" | "credit-purchases",
    options?: FetchBillingHistoryOptions,
): string => {
    const rawLimit = options?.limit;
    const limit =
        typeof rawLimit === "number" && rawLimit > 0
            ? Math.floor(rawLimit)
            : null;

    if (!limit) {
        return `/api/billing/${resource}`;
    }

    return `/api/billing/${resource}?limit=${encodeURIComponent(String(limit))}`;
};

const extractErrorMessage = async (response: Response): Promise<string> => {
    const fallback = "Unable to load billing history.";

    const payload =
        ((await response.json().catch(() => null)) as
            | { error?: string }
            | null) ?? null;

    if (!payload?.error || !payload.error.trim()) {
        return fallback;
    }

    return payload.error;
};

const fetchBillingRows = async <T>(url: string): Promise<T[]> => {
    const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    const payload = ((await response.json().catch(() => [])) as T[]) ?? [];
    return Array.isArray(payload) ? payload : [];
};

export const fetchBillingHistory = async (
    options?: FetchBillingHistoryOptions,
): Promise<BillingHistoryItem[]> => {
    const [invoices, creditPurchases] = await Promise.all([
        fetchBillingRows<BillingInvoiceApiItem>(
            toBillingUrl("invoices", options),
        ),
        fetchBillingRows<BillingCreditPurchaseApiItem>(
            toBillingUrl("credit-purchases", options),
        ),
    ]);

    return sortHistoryByRecency([
        ...invoices.map(normalizeInvoice),
        ...creditPurchases.map(normalizeCreditPurchase),
    ]);
};
