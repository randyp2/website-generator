"use client";

import { motion } from "framer-motion";
import React from "react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { usePortfolioEngagementMetrics } from "../hooks/usePortfolioEngagementMetrics";

const SEGMENT_DEFS: Array<{
    key: "views" | "likes" | "shares" | "comments";
    label: string;
    color: string;
}> = [
    { key: "views", label: "Views", color: "var(--chart-1)" },
    { key: "likes", label: "Likes", color: "var(--chart-2)" },
    { key: "shares", label: "Shares", color: "var(--chart-3)" },
    { key: "comments", label: "Comments", color: "var(--chart-4)" },
];

const numberFormatter = new Intl.NumberFormat("en-US");

type TooltipPayloadItem = {
    name?: string;
    value?: number;
    payload?: { color?: string; percent?: number };
};

const ChartTooltip: React.FC<{ active?: boolean; payload?: TooltipPayloadItem[] }> = ({
    active,
    payload,
}) => {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0];
    return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
            <div className="flex items-center gap-2">
                <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.payload?.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="ml-3 font-semibold text-foreground">
                    {numberFormatter.format(item.value ?? 0)}
                </span>
            </div>
        </div>
    );
};

export const ActivityMetricsChart: React.FC = () => {
    const { totals, isLoading } = usePortfolioEngagementMetrics();

    const segments = SEGMENT_DEFS.map((def) => ({
        name: def.label,
        value: totals[def.key],
        color: def.color,
    }));

    const hasData = totals.total > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative flex flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-lg"
        >
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Engagement Breakdown</h3>
                    <p className="text-sm text-muted-foreground">
                        Mix of views, likes, shares, and comments across all deployed portfolios
                    </p>
                </div>
            </div>

            <div className="h-64 w-full">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Loading engagement…
                    </div>
                ) : !hasData ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">No engagement yet</p>
                        <p>Counts will appear once visitors interact with your portfolios.</p>
                    </div>
                ) : (
                    <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,160px)] items-center gap-4">
                        <div className="relative h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip content={<ChartTooltip />} />
                                    <Pie
                                        data={segments}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius="62%"
                                        outerRadius="88%"
                                        paddingAngle={2}
                                        stroke="var(--card)"
                                        strokeWidth={2}
                                    >
                                        {segments.map((segment) => (
                                            <Cell key={segment.name} fill={segment.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Total
                                </span>
                                <span className="text-2xl font-semibold text-foreground">
                                    {numberFormatter.format(totals.total)}
                                </span>
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {segments.map((segment) => {
                                const pct = totals.total === 0
                                    ? 0
                                    : Math.round((segment.value / totals.total) * 100);
                                return (
                                    <li key={segment.name} className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: segment.color }}
                                            />
                                            <span className="truncate text-xs text-muted-foreground">
                                                {segment.name}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 items-baseline gap-1.5">
                                            <span className="text-sm font-semibold text-foreground">
                                                {numberFormatter.format(segment.value)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">{pct}%</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
