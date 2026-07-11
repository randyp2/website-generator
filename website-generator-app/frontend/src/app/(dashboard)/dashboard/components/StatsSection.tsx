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
    accentClassName: string;
    iconClassName: string;
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
            accentClassName: "bg-orange-500",
            iconClassName: "text-orange-500/15 dark:text-orange-300/15",
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
            accentClassName: "bg-sky-500",
            iconClassName: "text-sky-500/15 dark:text-sky-300/15",
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
            accentClassName: "bg-emerald-500",
            iconClassName: "text-emerald-500/15 dark:text-emerald-300/15",
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
                        <div className="relative min-h-[176px] overflow-hidden rounded-lg border border-border bg-card p-5 shadow-md transition-colors group-hover:border-foreground/20 md:p-6">
                            <Icon
                                aria-hidden="true"
                                className={`pointer-events-none absolute -bottom-7 -right-5 h-40 w-40 stroke-[0.85] transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:scale-105 ${stat.iconClassName}`}
                            />

                            <div className={`absolute left-0 top-6 h-10 w-1 ${stat.accentClassName}`} />

                            <div className="relative z-10 flex min-h-[128px] flex-col justify-between">
                                <div>
                                    <div className="text-xs font-semibold uppercase text-muted-foreground">
                                        {stat.label}
                                    </div>
                                    <div className="mt-1 text-4xl font-bold text-card-foreground">
                                        {stat.value}
                                    </div>
                                </div>

                                <div className="max-w-[70%] text-xs leading-relaxed text-muted-foreground">
                                    {stat.subtitle}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
