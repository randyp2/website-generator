import React from "react";
import { CheckCircle2, X } from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlanCell = boolean | string;

interface PlanComparisonRow {
    feature: string;
    free: PlanCell;
    annual: PlanCell;
    monthly: PlanCell;
}

const PLAN_COMPARISON_ROWS: readonly PlanComparisonRow[] = [
    { feature: "Price", free: "$0 / mo", annual: "$50 / yr", monthly: "$10 / mo" },
    {
        feature: "Credits included",
        free: "0 / mo",
        annual: "300 / mo",
        monthly: "300 / mo",
    },
    {
        feature: "Effective monthly rate",
        free: "$0.00",
        annual: "$4.17",
        monthly: "$10.00",
    },
    { feature: "1 active portfolio", free: true, annual: true, monthly: true },
    {
        feature: "Unlimited active portfolios",
        free: false,
        annual: true,
        monthly: true,
    },
    { feature: "Premium generation access", free: false, annual: true, monthly: true },
    { feature: "Priority processing", free: false, annual: true, monthly: true },
    {
        feature: "AI verification on every run",
        free: false,
        annual: true,
        monthly: true,
    },
    { feature: "Community support", free: true, annual: true, monthly: true },
    { feature: "Email support", free: false, annual: true, monthly: true },
];

const renderCell = (value: PlanCell, emphasize: boolean): React.ReactNode => {
    if (typeof value === "string") {
        return (
            <span
                className={cn(
                    "text-xs font-semibold sm:text-sm",
                    emphasize ? "text-primary" : "text-card-foreground",
                )}
            >
                {value}
            </span>
        );
    }

    if (value) {
        return (
            <CheckCircle2
                className={cn(
                    "size-4",
                    emphasize ? "text-primary" : "text-card-foreground",
                )}
            />
        );
    }

    return <X className="size-4 text-muted-foreground/50" />;
};

export const UsageTransparencySection: React.FC = () => {
    return (
        <Card className="overflow-hidden rounded-2xl bg-card">
            <CardContent className="px-0 pb-0">
                <div className="overflow-x-auto rounded-2xl">
                    <table className="w-full min-w-[780px] border-separate border-spacing-0 text-sm">
                        <thead>
                            <tr>
                                <th className="border-y border-border/60 bg-muted/60 px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                                    Feature
                                </th>
                                <th className="border-y border-border/60 bg-muted/60 px-6 py-4 text-center text-sm font-semibold text-card-foreground">
                                    Free
                                </th>
                                <th className="border-y border-primary/40 bg-primary/[0.24] px-6 py-4 text-center text-sm font-semibold text-primary">
                                    Pro Annual
                                </th>
                                <th className="border-y border-border/60 bg-muted/60 px-6 py-4 text-center text-sm font-semibold text-card-foreground">
                                    Pro Monthly
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {PLAN_COMPARISON_ROWS.map(
                                (row: PlanComparisonRow, rowIndex: number) => {
                                    const isTopSummaryRow: boolean =
                                        rowIndex < 3;

                                    return (
                                        <tr key={row.feature}>
                                            <td
                                                className={cn(
                                                    "border-b border-border/50 px-6 py-3.5 font-medium text-card-foreground",
                                                    isTopSummaryRow
                                                        ? "bg-muted/35"
                                                        : "bg-card",
                                                )}
                                            >
                                        {row.feature}
                                            </td>
                                            <td
                                                className={cn(
                                                    "border-b border-border/50 px-6 py-3.5",
                                                    isTopSummaryRow
                                                        ? "bg-muted/35"
                                                        : "bg-card",
                                                )}
                                            >
                                                <div className="flex items-center justify-center">
                                                    {renderCell(
                                                        row.free,
                                                        false,
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                className={cn(
                                                    "border-b border-primary/20 px-6 py-3.5",
                                                    isTopSummaryRow
                                                        ? "bg-primary/[0.14]"
                                                        : "bg-primary/[0.08]",
                                                )}
                                            >
                                                <div className="flex items-center justify-center">
                                                    {renderCell(
                                                        row.annual,
                                                        true,
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                className={cn(
                                                    "border-b border-border/50 px-6 py-3.5",
                                                    isTopSummaryRow
                                                        ? "bg-muted/35"
                                                        : "bg-card",
                                                )}
                                            >
                                                <div className="flex items-center justify-center">
                                                    {renderCell(
                                                        row.monthly,
                                                        false,
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
