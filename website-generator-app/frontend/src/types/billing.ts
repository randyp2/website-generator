export type PriceKey =
    | "WEBSITE_GENERATOR_PRO_MONTHLY"
    | "WEBSITE_GENERATOR_PRO_ANNUAL"
    | "CREDIT_PACK_SMALL"
    | "CREDIT_PACK_MEDIUM"
    | "CREDIT_PACK_LARGE";

export type BillingPlanTier = "free" | "pro";

export interface PricingPlan {
    priceKey: PriceKey;
    name: string;
    priceLabel: string;
    priceCadence: string;
    description: string;
    monthlyCredits: number;
    features: readonly string[];
    ctaLabel: string;
    highlighted?: boolean;
}

export interface CreditPack {
    priceKey: PriceKey;
    name: string;
    credits: number;
    priceLabel: string;
    description: string;
    ctaLabel: string;
}

export interface BillingSummary {
    tier: BillingPlanTier;
    creditBalance: number;
    nextRenewalDate: string | null;
}

export interface CreateCheckoutSessionResponse {
    sessionId: string;
    checkoutUrl: string;
    mode: string;
}
