"use client";

import React from "react";
import { CREDIT_PACKS, PRO_MONTHLY_PLAN } from "@/data/billing-catalog";
import type { PriceKey } from "@/types/billing";
import { CreditPackCard } from "./CreditPackCard";
import { PricingPlanCard } from "./PricingPlanCard";

interface PricingGridProps {
    onCheckout: (priceKey: PriceKey) => void;
    disabled?: boolean;
}

export const PricingGrid: React.FC<PricingGridProps> = ({
    onCheckout,
    disabled,
}) => {
    return (
        <section className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                    Pricing that scales with you
                </h2>
                <p className="text-sm text-muted-foreground">
                    Subscribe for monthly credits or top up with one-time packs.
                </p>
            </div>

            <div className="mt-6 grid gap-6 md:mt-10 md:grid-cols-2 lg:grid-cols-4">
                <PricingPlanCard
                    plan={PRO_MONTHLY_PLAN}
                    onSelect={onCheckout}
                    disabled={disabled}
                />
                {CREDIT_PACKS.map((pack) => (
                    <CreditPackCard
                        key={pack.priceKey}
                        pack={pack}
                        onSelect={onCheckout}
                        disabled={disabled}
                    />
                ))}
            </div>
        </section>
    );
};
