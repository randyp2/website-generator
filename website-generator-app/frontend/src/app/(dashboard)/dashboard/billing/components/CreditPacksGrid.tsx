"use client";

import React from "react";
import { CREDIT_PACKS } from "@/data/billing-catalog";
import type { PriceKey } from "@/types/billing";
import { CreditPackCard } from "./CreditPackCard";

interface CreditPacksGridProps {
    onCheckout: (priceKey: PriceKey) => void;
    disabled?: boolean;
}

export const CreditPacksGrid: React.FC<CreditPacksGridProps> = ({
    onCheckout,
    disabled,
}) => {
    return (
        <div className="mt-8 grid gap-6 md:mt-16 md:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
                <CreditPackCard
                    key={pack.priceKey}
                    pack={pack}
                    onSelect={onCheckout}
                    disabled={disabled}
                />
            ))}
        </div>
    );
};
