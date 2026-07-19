export interface BillingInvoiceApiItem {
    invoiceId?: string | null;
    stripeSubscriptionId?: string | null;
    status?: string | null;
    amountPaid?: number | null;
    amountDue?: number | null;
    currency?: string | null;
    billingReason?: string | null;
    planKey?: string | null;
    priceId?: string | null;
    hostedInvoiceUrl?: string | null;
    invoicePdfUrl?: string | null;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    occurredAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface BillingCreditPurchaseApiItem {
    ledgerEntryId?: string | null;
    checkoutSessionId?: string | null;
    paymentIntentId?: string | null;
    paymentStatus?: string | null;
    priceKey?: string | null;
    priceId?: string | null;
    credits?: number | null;
    amountPaid?: number | null;
    currency?: string | null;
    purchasedAt?: string | null;
}

export interface BillingHistoryItem {
    id: string;
    kind: "invoice" | "credit_purchase";
    referenceId: string;
    activityLabel: string | null;
    status: string;
    amountPaid: number | null;
    amountDue: number | null;
    currency: string | null;
    fallbackAmountLabel: string | null;
    viewUrl: string | null;
    occurredAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
