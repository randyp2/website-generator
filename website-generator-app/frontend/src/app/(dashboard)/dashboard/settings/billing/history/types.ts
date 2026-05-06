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

export interface BillingInvoiceHistoryItem {
    invoiceId: string;
    status: string;
    amountPaid: number | null;
    amountDue: number | null;
    currency: string | null;
    viewUrl: string | null;
    occurredAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
