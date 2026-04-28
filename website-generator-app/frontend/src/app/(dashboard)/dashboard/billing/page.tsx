"use client";

import React from "react";
import type { BillingSummary, PriceKey } from "@/types/billing";
import { BillingSummaryCard } from "./components/BillingSummaryCard";
import { PolicyCopy } from "./components/PolicyCopy";
import { PricingGrid } from "./components/PricingGrid";
import { UsageTransparencySection } from "./components/UsageTransparencySection";

// TODO(stripe): replace with the real billing summary fetched from the backend
// once GET /api/billing/summary (tier, creditBalance, nextRenewalDate) lands.
const PLACEHOLDER_SUMMARY: BillingSummary = {
    tier: "free",
    creditBalance: 0,
    nextRenewalDate: null,
};

const BillingPage: React.FC = () => {
    const summary: BillingSummary = PLACEHOLDER_SUMMARY;

    // TODO(stripe): wire to POST /api/billing/checkout/session.
    // const response = await fetch("/api/billing/checkout/session", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ priceKey }),
    // });
    // const data: CreateCheckoutSessionResponse = await response.json();
    // window.location.href = data.checkoutUrl;
    const handleCheckout = (priceKey: PriceKey): void => {
        console.log("[billing] checkout requested:", priceKey);
    };

    const handleUpgrade = (): void =>
        handleCheckout("WEBSITE_GENERATOR_PRO_MONTHLY");

    const handleBuyCredits = (): void => handleCheckout("CREDIT_PACK_MEDIUM");

    return (
        <div className="relative px-4 pb-14 pt-6 md:px-6">
            <div className="mx-auto max-w-6xl space-y-10">
                <BillingSummaryCard
                    summary={summary}
                    onPrimaryAction={handleUpgrade}
                    onBuyCredits={handleBuyCredits}
                />
                <PricingGrid onCheckout={handleCheckout} />
                <UsageTransparencySection />
                <PolicyCopy />
            </div>
        </div>
    );
};

export default BillingPage;
