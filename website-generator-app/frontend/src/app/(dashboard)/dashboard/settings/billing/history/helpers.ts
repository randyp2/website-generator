import type {
    BillingInvoiceApiItem,
    BillingInvoiceHistoryItem,
} from "./types";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const toEpochMs = (value: string | null): number | null => {
    if (!value) {
        return null;
    }

    const parsed = new Date(value).getTime();
    if (Number.isNaN(parsed)) {
        return null;
    }

    return parsed;
};

export const normalizeInvoice = (
    candidate: BillingInvoiceApiItem,
): BillingInvoiceHistoryItem => ({
    invoiceId: candidate.invoiceId?.trim() ?? "",
    status: candidate.status?.trim().toLowerCase() ?? "unknown",
    amountPaid:
        typeof candidate.amountPaid === "number" ? candidate.amountPaid : null,
    amountDue:
        typeof candidate.amountDue === "number" ? candidate.amountDue : null,
    currency: candidate.currency?.trim().toUpperCase() ?? null,
    viewUrl:
        candidate.hostedInvoiceUrl?.trim() ??
        candidate.invoicePdfUrl?.trim() ??
        null,
    occurredAt: candidate.occurredAt ?? null,
    createdAt: candidate.createdAt ?? null,
    updatedAt: candidate.updatedAt ?? null,
});

export const sortInvoicesByRecency = (
    invoices: BillingInvoiceHistoryItem[],
): BillingInvoiceHistoryItem[] => {
    return [...invoices].sort((left, right) => {
        const leftTimestamp =
            toEpochMs(left.occurredAt) ??
            toEpochMs(left.createdAt) ??
            toEpochMs(left.updatedAt) ??
            0;
        const rightTimestamp =
            toEpochMs(right.occurredAt) ??
            toEpochMs(right.createdAt) ??
            toEpochMs(right.updatedAt) ??
            0;

        return rightTimestamp - leftTimestamp;
    });
};

export const filterInvoicesWithinPastYear = (
    invoices: BillingInvoiceHistoryItem[],
): BillingInvoiceHistoryItem[] => {
    const cutoffMs = Date.now() - ONE_YEAR_MS;

    return invoices.filter((invoice) => {
        const timestamp =
            toEpochMs(invoice.occurredAt) ??
            toEpochMs(invoice.createdAt) ??
            toEpochMs(invoice.updatedAt);

        if (timestamp == null) {
            return false;
        }

        return timestamp >= cutoffMs;
    });
};

export const formatInvoiceAmount = (
    invoice: BillingInvoiceHistoryItem,
): string => {
    const amountMinor = invoice.amountPaid ?? invoice.amountDue;
    if (amountMinor == null) {
        return "--";
    }

    const formattedCurrency = invoice.currency ?? "USD";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: formattedCurrency,
    }).format(amountMinor / 100);
};

export const formatInvoiceDateTime = (invoice: BillingInvoiceHistoryItem): string => {
    const timestamp =
        invoice.occurredAt ?? invoice.createdAt ?? invoice.updatedAt ?? null;
    const parsed = timestamp ? new Date(timestamp) : null;

    if (!parsed || Number.isNaN(parsed.getTime())) {
        return "--";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(parsed);
};

export const formatInvoiceReference = (
    invoiceId: string,
    rowIndex: number,
): string => {
    const normalized = invoiceId.trim().toUpperCase();
    if (!normalized) {
        return `INVOICE-${rowIndex + 1}`;
    }

    const withoutPrefix = normalized.replace(/^IN_/, "");
    if (withoutPrefix.length <= 14) {
        return withoutPrefix;
    }

    return `${withoutPrefix.slice(0, 10)}-${withoutPrefix.slice(-4)}`;
};

export const formatStatusLabel = (status: string): string => {
    const normalized = status.trim().toLowerCase();
    if (!normalized) {
        return "Unknown";
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const statusBadgeClassName = (status: string): string => {
    switch (status.trim().toLowerCase()) {
        case "paid":
            return "bg-emerald-500/20 text-emerald-300";
        case "open":
            return "bg-amber-500/20 text-amber-300";
        case "void":
        case "uncollectible":
        case "failed":
            return "bg-red-500/20 text-red-300";
        default:
            return "bg-white/10 text-slate-300";
    }
};
