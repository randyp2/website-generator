"use client";

import { motion } from "framer-motion";
import React from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { usePortfolioEngagementMetrics } from "../hooks/usePortfolioEngagementMetrics";

const truncate = (value: string, max = 18): string =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value;

type TooltipPayloadItem = {
    name?: string;
    value?: number;
    color?: string;
};

const ChartTooltip: React.FC<{
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}> = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    const total = payload.reduce((sum, item) => sum + (item.value ?? 0), 0);
    return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
            <p className="mb-1.5 font-semibold text-foreground">{label}</p>
            <div className="space-y-1">
                {payload.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                        </span>
                        <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                ))}
                <div className="mt-1.5 flex items-center justify-between border-t border-border pt-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</span>
                    <span className="font-semibold text-foreground">{total}</span>
                </div>
            </div>
        </div>
    );
};

export const EngagementTrendChart: React.FC = () => {
    const { rows, isLoading } = usePortfolioEngagementMetrics();

    const chartData = rows.map((row) => ({
        title: truncate(row.title),
        Views: row.views,
        Likes: row.likes,
        Shares: row.shares,
        Comments: row.comments,
    }));

    const chartHeight = Math.max(chartData.length * 64 + 56, 280);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative flex flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-lg md:p-6"
        >
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">Engagement by Portfolio</h3>
                    <p className="text-sm text-muted-foreground">
                        Views, likes, shares, and comments per deployed portfolio
                    </p>
                </div>
            </div>

            <div
                className="w-full"
                style={{ height: chartData.length === 0 || isLoading ? 280 : chartHeight }}
            >
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Loading engagement…
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">No deployed portfolios yet</p>
                        <p>Publish a portfolio to see real engagement data here.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
                            barCategoryGap="22%"
                            maxBarSize={40}
                        >
                            <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.5} />
                            <XAxis
                                type="number"
                                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="title"
                                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: "var(--muted)", fillOpacity: 0.3 }}
                                content={<ChartTooltip />}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                            />
                            <Bar dataKey="Views" stackId="engagement" fill="var(--chart-1)" radius={[4, 0, 0, 4]} />
                            <Bar dataKey="Likes" stackId="engagement" fill="var(--chart-2)" />
                            <Bar dataKey="Shares" stackId="engagement" fill="var(--chart-3)" />
                            <Bar dataKey="Comments" stackId="engagement" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};
