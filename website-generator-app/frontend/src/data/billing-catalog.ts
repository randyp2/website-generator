import type { CreditPack, PricingPlan } from "@/types/billing";

export const FREE_PLAN: PricingPlan = {
    priceKey: null,
    name: "Free",
    description: "Get started at no cost.",
    priceLabel: "$0",
    pricePeriod: "/mo",
    cadenceLabel: "No payment required",
    monthlyCredits: 0,
    features: [
        "1 active portfolio",
        "Standard generation queue",
        "Community support",
    ],
    ctaLabel: "Current plan",
};

export const PRO_ANNUAL_PLAN: PricingPlan = {
    priceKey: "WEBSITE_GENERATOR_PRO_ANNUAL",
    name: "Pro Annual",
    description: "All Pro features, billed yearly for the best value.",
    priceLabel: "$50",
    pricePeriod: "/yr",
    cadenceLabel: "Billed annually ($4.17/mo)",
    monthlyCredits: 300,
    features: [
        "Everything in Free",
        "300 credits refreshed every month",
        "Premium generation access",
        "Priority processing",
        "AI verification on every run",
        "Unlimited active portfolios",
        "Email support",
    ],
    ctaLabel: "Choose Pro Annual",
    highlighted: true,
};

export const PRO_MONTHLY_PLAN: PricingPlan = {
    priceKey: "WEBSITE_GENERATOR_PRO_MONTHLY",
    name: "Pro Monthly",
    description: "All Pro features, billed month to month.",
    priceLabel: "$10",
    pricePeriod: "/mo",
    cadenceLabel: "Billed monthly",
    monthlyCredits: 300,
    features: [
        "Everything in Free",
        "300 credits refreshed every month",
        "Premium generation access",
        "Priority processing",
        "AI verification on every run",
        "Unlimited active portfolios",
        "Email support",
    ],
    ctaLabel: "Choose Pro",
};

export const SUBSCRIPTION_PLANS: readonly PricingPlan[] = [
    FREE_PLAN,
    PRO_ANNUAL_PLAN,
    PRO_MONTHLY_PLAN,
];

export const CREDIT_PACKS: readonly CreditPack[] = [
    {
        priceKey: "CREDIT_PACK_SMALL",
        name: "Small Pack",
        credits: 100,
        priceLabel: "$10",
        description: "Perfect for trying things out.",
        ctaLabel: "Buy Small",
    },
    {
        priceKey: "CREDIT_PACK_MEDIUM",
        name: "Medium Pack",
        credits: 500,
        priceLabel: "$45",
        description: "Best value for regular usage.",
        ctaLabel: "Buy Medium",
    },
    {
        priceKey: "CREDIT_PACK_LARGE",
        name: "Large Pack",
        credits: 2000,
        priceLabel: "$150",
        description: "For power users and teams.",
        ctaLabel: "Buy Large",
    },
];
