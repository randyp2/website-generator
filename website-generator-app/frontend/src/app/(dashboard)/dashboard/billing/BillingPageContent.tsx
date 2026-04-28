"use client";

import React, { useState } from "react";
import type { BillingMode, PriceKey } from "@/types/billing";
import { BillingModeTabs } from "./components/BillingModeTabs";
import { CreditPacksGrid } from "./components/CreditPacksGrid";
import { PolicyCopy } from "./components/PolicyCopy";
import { SubscriptionPlansGrid } from "./components/SubscriptionPlansGrid";
import { UsageTransparencySection } from "./components/UsageTransparencySection";

const BillingPageContent: React.FC = () => {
    const [mode, setMode] = useState<BillingMode>("subscription");

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

    return (
        <div className="relative px-4 pb-14 pt-6 md:px-6 [&_button]:cursor-pointer">
            <div className="mx-auto max-w-6xl space-y-12">
                <section>
                    <div className="mx-auto max-w-2xl space-y-6 text-center">
                        <h2 className="text-center text-3xl font-semibold lg:text-4xl">
                            Pricing that scales with you
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Subscribe for monthly credits, or top up any time
                            with one-time packs.
                        </p>
                        <div className="flex justify-center">
                            <BillingModeTabs
                                value={mode}
                                onChange={setMode}
                            />
                        </div>
                    </div>

                    {mode === "subscription" ? (
                        <SubscriptionPlansGrid onCheckout={handleCheckout} />
                    ) : (
                        <CreditPacksGrid onCheckout={handleCheckout} />
                    )}
                </section>

                <UsageTransparencySection />
                <PolicyCopy />
            </div>
        </div>
    );
};

export default BillingPageContent;
