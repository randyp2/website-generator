"use client";

import React from "react";
import { SUBSCRIPTION_PLANS } from "@/data/billing-catalog";
import { cn } from "@/lib/utils";
import type { PriceKey } from "@/types/billing";
import { PricingPlanCard } from "./PricingPlanCard";

interface SubscriptionPlansGridProps {
    onCheckout: (priceKey: PriceKey) => void;
    disabled?: boolean;
    activePriceKey?: PriceKey | null;
}

export const SubscriptionPlansGrid: React.FC<SubscriptionPlansGridProps> = ({
    onCheckout,
    disabled,
    activePriceKey,
}) => {
    return (
        <div className="relative mt-8 overflow-visible md:mt-16">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-[560px] w-[1020px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(204,125,35,0.72)_0%,rgba(204,125,35,0.55)_14%,rgba(204,125,35,0.32)_32%,rgba(204,125,35,0.14)_52%,rgba(204,125,35,0.04)_70%,rgba(204,125,35,0)_84%)] blur-[96px] md:block"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(204,125,35,0.85)_0%,rgba(204,125,35,0.48)_42%,rgba(204,125,35,0)_78%)] blur-3xl md:block"
            />

            <div className="relative grid gap-4 md:gap-2 md:grid-cols-3">
                {SUBSCRIPTION_PLANS.map((plan, index: number) => {
                    const isMiddlePlan: boolean = index === 1;
                    const isRightPlan: boolean = index === 2;

                    return (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative",
                                index === 0 && "z-10",
                                isMiddlePlan &&
                                    "z-30 md:after:pointer-events-none md:after:absolute md:after:left-1/2 md:after:top-1/2 md:after:-z-10 md:after:h-[320px] md:after:w-[500px] md:after:-translate-x-1/2 md:after:-translate-y-1/2 md:after:rounded-full md:after:bg-[radial-gradient(circle,rgba(204,125,35,0.6)_0%,rgba(204,125,35,0.26)_34%,rgba(204,125,35,0)_72%)] md:after:blur-xl",
                                isRightPlan && "z-40",
                            )}
                        >
                            <PricingPlanCard
                                plan={plan}
                                onSelect={onCheckout}
                                disabled={disabled}
                                isCurrentPlan={
                                    activePriceKey != null &&
                                    plan.priceKey === activePriceKey
                                }
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
