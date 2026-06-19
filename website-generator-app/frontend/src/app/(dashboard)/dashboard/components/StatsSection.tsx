"use client";

import { motion } from "framer-motion";
import React from "react";
import type { IconType } from "react-icons";
import { FiActivity, FiFolder, FiGlobe } from "react-icons/fi";
import { usePortfolioEngagementMetrics } from "../hooks/usePortfolioEngagementMetrics";

type StatCard = {
    label: string;
    value: string;
    subtitle: string;
    icon: IconType;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const formatValue = (value: number, isLoading: boolean): string =>
    isLoading ? "—" : numberFormatter.format(value);

export const StatsSection: React.FC = () => {
    const {
        totalPortfolioCount,
        deployedPortfolioCount,
        totals,
        isLoading,
    } = usePortfolioEngagementMetrics();

    const draftCount = Math.max(totalPortfolioCount - deployedPortfolioCount, 0);

    const stats: StatCard[] = [
        {
            label: "Portfolios",
            value: formatValue(totalPortfolioCount, isLoading),
            subtitle: isLoading
                ? "Loading…"
                : draftCount === 0
                    ? "All deployed"
                    : `${draftCount} not yet deployed`,
            icon: FiFolder,
        },
        {
            label: "Deployed",
            value: formatValue(deployedPortfolioCount, isLoading),
            subtitle: isLoading
                ? "Loading…"
                : deployedPortfolioCount === 0
                    ? "Publish a portfolio to go live"
                    : `${deployedPortfolioCount === 1 ? "1 site" : `${deployedPortfolioCount} sites`} currently live`,
            icon: FiGlobe,
        },
        {
            label: "Total Engagement",
            value: formatValue(totals.total, isLoading),
            subtitle: isLoading
                ? "Loading…"
                : deployedPortfolioCount === 0
                    ? "No deployed portfolios yet"
                    : `Across ${deployedPortfolioCount === 1 ? "1 deployed portfolio" : `${deployedPortfolioCount} deployed portfolios`}`,
            icon: FiActivity,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            opacity: { delay: 0.1 * index, duration: 0.5 },
                            y: { type: "spring", stiffness: 400, damping: 30 },
                        }}
                        whileHover={{ y: -4 }}
                        className="group relative"
                    >
                        <div className="relative rounded-2xl border border-border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="mb-2">
                                <div className="text-3xl font-bold text-card-foreground">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground">{stat.subtitle}</div>

                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/0 transition-shadow group-hover:bg-primary/5" />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
