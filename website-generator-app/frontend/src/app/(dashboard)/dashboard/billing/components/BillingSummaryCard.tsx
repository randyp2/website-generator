"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { BillingSummary } from "@/types/billing";

interface BillingSummaryCardProps {
    summary: BillingSummary;
    onPrimaryAction: () => void;
    onBuyCredits: () => void;
    disabled?: boolean;
}

const formatRenewalDate = (iso: string | null): string => {
    if (!iso) return "—";
    const parsed: Date = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return iso;
    return parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({
    summary,
    onPrimaryAction,
    onBuyCredits,
    disabled,
}) => {
    const isPro: boolean = summary.tier === "pro";

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Billing</CardTitle>
                <CardDescription>
                    Manage your plan, credits, and payment activity.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Current Plan
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-card-foreground">
                            {isPro ? "Pro" : "Free"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Credit Balance
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-card-foreground">
                            {summary.creditBalance.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {isPro ? "Renews On" : "Status"}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-card-foreground">
                            {isPro
                                ? formatRenewalDate(summary.nextRenewalDate)
                                : "Free tier"}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                        type="button"
                        onClick={onPrimaryAction}
                        disabled={disabled}
                        className="sm:flex-1"
                    >
                        {isPro ? "Manage Plan" : "Upgrade to Pro"}
                    </Button>
                    <Button
                        type="button"
                        onClick={onBuyCredits}
                        disabled={disabled}
                        variant="outline"
                        className="sm:flex-1"
                    >
                        Buy Credits
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
