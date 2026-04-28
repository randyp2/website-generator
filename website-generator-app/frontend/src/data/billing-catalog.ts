import type { CreditPack, PricingPlan } from "@/types/billing";

export const FREE_TIER_FEATURES: readonly string[] = [
    "Up to 1 active portfolio",
    "Standard generation queue",
    "Community support",
];

export const PRO_MONTHLY_PLAN: PricingPlan = {
    priceKey: "WEBSITE_GENERATOR_PRO_MONTHLY",
    name: "Website Generator Pro",
    priceLabel: "$19",
    priceCadence: "/ month",
    description: "Premium generation with monthly credits.",
    monthlyCredits: 300,
    features: [
        "300 credits refreshed every month",
        "Premium generation access",
        "Priority processing",
        "AI verification on every run",
        "Email support",
    ],
    ctaLabel: "Start Pro",
    highlighted: true,
};

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
