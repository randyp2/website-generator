import { CREDIT_PACKS } from "@/data/billing-catalog";
import type {
    BillingCreditPurchaseApiItem,
    BillingHistoryItem,
    BillingInvoiceApiItem,
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
): BillingHistoryItem => {
    const invoiceId = candidate.invoiceId?.trim() ?? "";
    return {
        id: `invoice:${invoiceId}`,
        kind: "invoice",
        referenceId: invoiceId,
        activityLabel: null,
        status: candidate.status?.trim().toLowerCase() ?? "unknown",
        amountPaid:
            typeof candidate.amountPaid === "number"
                ? candidate.amountPaid
                : null,
        amountDue:
            typeof candidate.amountDue === "number"
                ? candidate.amountDue
                : null,
        currency: candidate.currency?.trim().toUpperCase() ?? null,
        fallbackAmountLabel: null,
        viewUrl:
            candidate.hostedInvoiceUrl?.trim() ??
            candidate.invoicePdfUrl?.trim() ??
            null,
        occurredAt: candidate.occurredAt ?? null,
        createdAt: candidate.createdAt ?? null,
        updatedAt: candidate.updatedAt ?? null,
    };
};

export const normalizeCreditPurchase = (
    candidate: BillingCreditPurchaseApiItem,
): BillingHistoryItem => {
    const priceKey = candidate.priceKey?.trim() ?? "";
    const pack = CREDIT_PACKS.find((item) => item.priceKey === priceKey) ?? null;
    const credits =
        typeof candidate.credits === "number" ? candidate.credits : pack?.credits;
    const ledgerEntryId = candidate.ledgerEntryId?.trim() ?? "";
    const checkoutSessionId = candidate.checkoutSessionId?.trim() ?? "";
    const paymentIntentId = candidate.paymentIntentId?.trim() ?? "";
    const purchasedAt = candidate.purchasedAt ?? null;
    const creditLabel =
        typeof credits === "number"
            ? `${credits.toLocaleString()} credits`
            : "Credit pack";

    return {
        id: `credit-purchase:${ledgerEntryId || checkoutSessionId}`,
        kind: "credit_purchase",
        referenceId: paymentIntentId || checkoutSessionId || ledgerEntryId,
        activityLabel: pack ? `${pack.name} · ${creditLabel}` : creditLabel,
        status:
            candidate.paymentStatus?.trim().toLowerCase() ===
            "no_payment_required"
                ? "paid"
                : (candidate.paymentStatus?.trim().toLowerCase() ?? "paid"),
        amountPaid:
            typeof candidate.amountPaid === "number"
                ? candidate.amountPaid
                : null,
        amountDue: null,
        currency: candidate.currency?.trim().toUpperCase() ?? null,
        fallbackAmountLabel: pack?.priceLabel ?? null,
        viewUrl: null,
        occurredAt: purchasedAt,
        createdAt: purchasedAt,
        updatedAt: null,
    };
};

export const sortHistoryByRecency = (
    items: BillingHistoryItem[],
): BillingHistoryItem[] => {
    return [...items].sort((left, right) => {
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

export const filterHistoryWithinPastYear = (
    items: BillingHistoryItem[],
): BillingHistoryItem[] => {
    const cutoffMs = Date.now() - ONE_YEAR_MS;

    return items.filter((item) => {
        const timestamp =
            toEpochMs(item.occurredAt) ??
            toEpochMs(item.createdAt) ??
            toEpochMs(item.updatedAt);

        if (timestamp == null) {
            return false;
        }

        return timestamp >= cutoffMs;
    });
};

export const formatHistoryAmount = (item: BillingHistoryItem): string => {
    const amountMinor = item.amountPaid ?? item.amountDue;
    if (amountMinor == null) {
        return item.fallbackAmountLabel ?? "--";
    }

    const formattedCurrency = item.currency ?? "USD";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: formattedCurrency,
    }).format(amountMinor / 100);
};

export const formatHistoryDateTime = (item: BillingHistoryItem): string => {
    const timestamp =
        item.occurredAt ?? item.createdAt ?? item.updatedAt ?? null;
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

const formatStripeReference = (
    referenceId: string,
    rowIndex: number,
): string => {
    const normalized = referenceId.trim().toUpperCase();
    if (!normalized) {
        return `INVOICE-${rowIndex + 1}`;
    }

    const withoutPrefix = normalized.replace(/^IN_/, "");
    if (withoutPrefix.length <= 14) {
        return withoutPrefix;
    }

    return `${withoutPrefix.slice(0, 10)}-${withoutPrefix.slice(-4)}`;
};

export const formatHistoryReference = (
    item: BillingHistoryItem,
    rowIndex: number,
): string => {
    if (item.activityLabel) {
        return item.activityLabel;
    }
    return `Invoice ${formatStripeReference(item.referenceId, rowIndex)}`;
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
