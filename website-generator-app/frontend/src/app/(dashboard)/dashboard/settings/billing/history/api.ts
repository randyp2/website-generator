import type {
    BillingInvoiceApiItem,
    BillingInvoiceHistoryItem,
} from "./types";
import { normalizeInvoice, sortInvoicesByRecency } from "./helpers";

interface FetchBillingInvoicesOptions {
    limit?: number;
}

const toInvoicesUrl = (options?: FetchBillingInvoicesOptions): string => {
    const rawLimit = options?.limit;
    const limit =
        typeof rawLimit === "number" && rawLimit > 0
            ? Math.floor(rawLimit)
            : null;

    if (!limit) {
        return "/api/billing/invoices";
    }

    return `/api/billing/invoices?limit=${encodeURIComponent(String(limit))}`;
};

const extractErrorMessage = async (response: Response): Promise<string> => {
    const fallback = "Unable to load billing invoices.";

    const payload =
        ((await response.json().catch(() => null)) as
            | { error?: string }
            | null) ?? null;

    if (!payload?.error || !payload.error.trim()) {
        return fallback;
    }

    return payload.error;
};

export const fetchBillingInvoices = async (
    options?: FetchBillingInvoicesOptions,
): Promise<BillingInvoiceHistoryItem[]> => {
    const response = await fetch(toInvoicesUrl(options), {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    const payload =
        ((await response.json().catch(() => [])) as BillingInvoiceApiItem[]) ??
        [];

    if (!Array.isArray(payload)) {
        return [];
    }

    return sortInvoicesByRecency(payload.map(normalizeInvoice));
};
