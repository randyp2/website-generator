"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useProfileMeQuery } from "@/hooks/useProfileMeQuery";
import type { HeaderBillingSummary } from "./header-billing.types";

const toPlanLabel = (planKey: string | null): string => {
    if (!planKey) {
        return "No active plan";
    }

    if (planKey === "website_generator_pro") {
        return "PortRN Pro";
    }

    return planKey
        .split("_")
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
};

const HeaderCreditsChip = () => {
    const { data: profile } = useProfileMeQuery();
    const billingSummary = useMemo<HeaderBillingSummary | null>(() => {
        const balance = profile?.billing?.creditBalance;
        const activePlanKey = profile?.billing?.activePlanKey;

        if (!profile?.billing) {
            return null;
        }

        return {
            creditBalance: typeof balance === "number" ? balance : 0,
            activePlanKey:
                typeof activePlanKey === "string" && activePlanKey.trim()
                    ? activePlanKey.trim()
                    : null,
        };
    }, [profile?.billing]);

    const creditLabel = useMemo(() => {
        const balance = billingSummary?.creditBalance ?? null;
        if (balance == null) {
            return "--";
        }
        return balance.toLocaleString();
    }, [billingSummary]);

    const planLabel = useMemo(
        () => toPlanLabel(billingSummary?.activePlanKey ?? null),
        [billingSummary],
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Open billing summary"
                    className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-muted/45 px-3.5 py-1.5 transition-colors hover:cursor-pointer hover:border-primary/30 hover:bg-muted/70"
                >
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-semibold text-foreground">
                        {creditLabel}
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
                                Plan
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {planLabel}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">
                                Credits
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {creditLabel}
                            </span>
                        </div>
                    </div>

                    <Button asChild size="sm" className="w-full rounded-lg">
                        <Link href="/dashboard/billing">Add more credits</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default HeaderCreditsChip;
