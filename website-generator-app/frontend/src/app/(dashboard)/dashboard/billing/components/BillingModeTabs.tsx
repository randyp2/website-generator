"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { BillingMode } from "@/types/billing";

interface BillingModeTabsProps {
    value: BillingMode;
    onChange: (mode: BillingMode) => void;
}

interface TabOption {
    value: BillingMode;
    label: string;
}

const OPTIONS: readonly TabOption[] = [
    { value: "subscription", label: "Subscription" },
    { value: "credits", label: "Credits" },
];

export const BillingModeTabs: React.FC<BillingModeTabsProps> = ({
    value,
    onChange,
}) => {
    return (
        <div
            role="tablist"
            aria-label="Billing options"
            className="inline-flex items-center rounded-full border border-border bg-muted p-1"
        >
            {OPTIONS.map((option: TabOption) => {
                const isActive: boolean = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
