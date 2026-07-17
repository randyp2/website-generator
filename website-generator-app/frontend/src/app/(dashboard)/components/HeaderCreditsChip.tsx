"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useProfileMeQuery } from "@/hooks/useProfileMeQuery";
import {
    getBillingAccessLabel,
    getCompactBillingAccessLabel,
} from "@/lib/billing/access-label";
import type { HeaderBillingSummary } from "./header-billing.types";

const HeaderCreditsChip = () => {
    const { data: profile } = useProfileMeQuery();
    const billingSummary = useMemo<HeaderBillingSummary | null>(() => {
        if (!profile) {
            return null;
        }

        const balance = profile.billing?.creditBalance;
        const activePlanKey = profile.billing?.activePlanKey;
        const activePromotionKey = profile.billing?.activePromotionKey;

        return {
            creditBalance: typeof balance === "number" ? balance : 0,
            activePlanKey:
                typeof activePlanKey === "string" && activePlanKey.trim()
                    ? activePlanKey.trim()
                    : null,
            activePromotionKey:
                typeof activePromotionKey === "string" &&
                activePromotionKey.trim()
                    ? activePromotionKey.trim()
                    : null,
            portfolioGenerationAllowanceRemaining:
                profile.billing?.portfolioGenerationAllowanceRemaining ?? 0,
            portfolioRefinementAllowanceRemaining:
                profile.billing?.portfolioRefinementAllowanceRemaining ?? 0,
            assetVerificationAllowanceRemaining:
                profile.billing?.assetVerificationAllowanceRemaining ?? 0,
        };
    }, [profile]);

    const creditLabel = useMemo(() => {
        const balance = billingSummary?.creditBalance ?? null;
        if (balance == null) {
            return "--";
        }
        return balance.toLocaleString();
    }, [billingSummary]);

    const accessLabel = useMemo(
        () =>
            billingSummary ? getBillingAccessLabel(billingSummary) : "--",
        [billingSummary],
    );
    const compactLabel = useMemo(
        () => getCompactBillingAccessLabel(billingSummary),
        [billingSummary],
    );
    const showAllowances = Boolean(
        billingSummary?.activePlanKey ||
        billingSummary?.activePromotionKey ||
        billingSummary?.portfolioGenerationAllowanceRemaining ||
        billingSummary?.portfolioRefinementAllowanceRemaining ||
        billingSummary?.assetVerificationAllowanceRemaining,
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Open usage and billing summary"
                    className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-muted/45 px-3.5 py-1.5 transition-colors hover:cursor-pointer hover:border-primary/30 hover:bg-muted/70"
                >
                    <CreditCard className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-semibold text-foreground">
                        {compactLabel}
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                side="bottom"
                sideOffset={10}
                className="w-64 rounded-xl border border-border bg-background p-4"
            >
                <div className="space-y-3">
                    <div>
                        <p className="text-base font-semibold text-foreground">
                            Billing
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Quick account snapshot
                        </p>
                    </div>

                    <div className="space-y-2 rounded-lg border border-border bg-muted/35 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">
                                Access
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {accessLabel}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">
                                Purchased credits
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {creditLabel}
                            </span>
                        </div>
                        {showAllowances ? (
                            <>
                                <div className="border-t border-border/70 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Current allowances
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-foreground">
                                        Generations
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {billingSummary?.portfolioGenerationAllowanceRemaining ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-foreground">
                                        Refinements
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {billingSummary?.portfolioRefinementAllowanceRemaining ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-foreground">
                                        Verifications
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {billingSummary?.assetVerificationAllowanceRemaining ?? 0}
                                    </span>
                                </div>
                            </>
                        ) : null}
                    </div>

                    <Button asChild size="sm" className="w-full rounded-lg">
                        <Link href="/dashboard/billing">Plans and credits</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default HeaderCreditsChip;
