"use client";

import React from "react";
import { FiEye, FiHeart, FiShare2, FiUserCheck } from "react-icons/fi";
import {
    fetchPortfolioEngagementSummary,
} from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.api";
import type {
    PortfolioEngagementSummary,
} from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.types";

type PublishedPortfolioAnalyticsProps = {
    slug?: string | null;
};

type AnalyticsItem = {
    label: string;
    value: string;
    delta: string | null;
    icon: typeof FiEye;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const formatCount = (
    value: number | undefined | null,
    isLoading: boolean,
): string => {
    if (isLoading) return "—";
    if (typeof value !== "number" || Number.isNaN(value)) return "0";
    return numberFormatter.format(value);
};

export const PublishedPortfolioAnalytics: React.FC<PublishedPortfolioAnalyticsProps> = ({
    slug,
}) => {
    const [summary, setSummary] = React.useState<PortfolioEngagementSummary | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        const trimmedSlug = slug?.trim();
        if (!trimmedSlug) {
            setSummary(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        fetchPortfolioEngagementSummary(trimmedSlug)
            .then((data) => {
                if (!cancelled) setSummary(data);
            })
            .catch(() => {
                if (!cancelled) setSummary(null);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [slug]);

    const items: AnalyticsItem[] = [
        {
            label: "Views",
            value: formatCount(summary?.viewsCount, isLoading),
            delta: null,
            icon: FiEye,
        },
        {
            label: "Likes",
            value: formatCount(summary?.likesCount, isLoading),
            delta: null,
            icon: FiHeart,
        },
        {
            label: "Shares",
            value: formatCount(summary?.sharesCount, isLoading),
            delta: null,
            icon: FiShare2,
        },
        {
            label: "Recruiter Interest",
            value: "31",
            delta: "+14.9%",
            icon: FiUserCheck,
        },
    ];

    return (
        <section className="relative flex h-full flex-1 overflow-hidden rounded-2xl border border-border bg-card/80 p-4 md:p-5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent dark:from-primary/15 dark:via-transparent dark:to-accent/12" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_30%)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-3xl dark:bg-primary/12" />

            <div className="relative grid min-h-[280px] flex-1 grid-cols-2 grid-rows-2">
                <div className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-border/70" />
                <div className="pointer-events-none absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-border/70" />
                {items.map((item) => {
                    return (
                        <div
                            key={item.label}
                            className="group relative flex h-full flex-col gap-5 p-4 md:p-5"
                        >
                            <div className="relative flex items-start justify-between gap-3">
                                <p className="max-w-[8rem] text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:text-[12px]">
                                    {item.label}
                                </p>
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-sm">
                                    <item.icon className="h-5 w-5 text-foreground/75 md:h-[22px] md:w-[22px]" />
                                </span>
                            </div>

                            <div className="relative mt-auto">
                                <p className="text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-foreground md:text-[2.5rem]">
                                    {item.value}
                                </p>
                                {item.delta ? (
                                    <p className="mt-2 text-base font-semibold text-primary">
                                        {item.delta}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
