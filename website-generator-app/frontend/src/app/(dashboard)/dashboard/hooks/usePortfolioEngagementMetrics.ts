"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import { fetchPortfolioEngagementSummary } from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.api";
import type { PortfolioEngagementSummary } from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.types";
import { isDeployedPortfolio } from "../utils/deployedPortfolio";
import { usePortfolioListQuery } from "./usePortfolioListQuery";

export type PortfolioEngagementRow = {
    portfolioId: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    shares: number;
    comments: number;
    total: number;
};

export type EngagementTotals = {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    total: number;
};

export type PortfolioEngagementMetrics = {
    rows: PortfolioEngagementRow[];
    totals: EngagementTotals;
    isLoading: boolean;
    deployedPortfolioCount: number;
    totalPortfolioCount: number;
};

const EMPTY_TOTALS: EngagementTotals = {
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
    total: 0,
};

export const usePortfolioEngagementMetrics = (): PortfolioEngagementMetrics => {
    const { user } = useUser();
    const {
        data: portfolios = [],
        isLoading: isPortfolioListLoading,
    } = usePortfolioListQuery(user?.id);
    const [summariesBySlug, setSummariesBySlug] = useState<Record<string, PortfolioEngagementSummary>>({});
    const [isEngagementLoading, setIsEngagementLoading] = useState<boolean>(false);

    const deployedSlugs = useMemo(
        () =>
            portfolios
                .filter(isDeployedPortfolio)
                .map((p) => p.slug?.trim())
                .filter((slug): slug is string => Boolean(slug)),
        [portfolios],
    );
    const deployedSlugKey = deployedSlugs.join("|");

    useEffect(() => {
        let cancelled = false;

        if (deployedSlugs.length === 0) {
            setSummariesBySlug({});
            setIsEngagementLoading(false);
            return;
        }

        const loadSummaries = async () => {
            setIsEngagementLoading(true);
            try {
                const results = await Promise.allSettled(
                    deployedSlugs.map((slug) => fetchPortfolioEngagementSummary(slug)),
                );

                if (cancelled) return;
                const next: Record<string, PortfolioEngagementSummary> = {};
                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        next[deployedSlugs[index]] = result.value;
                    }
                });
                setSummariesBySlug(next);
            } catch {
                if (!cancelled) {
                    setSummariesBySlug({});
                }
            } finally {
                if (!cancelled) setIsEngagementLoading(false);
            }
        };

        loadSummaries();

        return () => {
            cancelled = true;
        };
    }, [deployedSlugKey, deployedSlugs]);

    const isLoading = isPortfolioListLoading || isEngagementLoading;

    return useMemo(() => {
        const rows: PortfolioEngagementRow[] = portfolios
            .filter(isDeployedPortfolio)
            .map((portfolio) => {
                const slug = portfolio.slug?.trim() ?? "";
                const summary = slug ? summariesBySlug[slug] : undefined;
                const views = summary?.viewsCount ?? 0;
                const likes = summary?.likesCount ?? 0;
                const shares = summary?.sharesCount ?? 0;
                const comments = summary?.commentsCount ?? 0;
                return {
                    portfolioId: String(portfolio.id),
                    title: portfolio.title?.trim() || "Untitled Portfolio",
                    slug,
                    views,
                    likes,
                    shares,
                    comments,
                    total: views + likes + shares + comments,
                };
            })
            .sort((a, b) => b.total - a.total);

        const totals = rows.reduce<EngagementTotals>(
            (acc, row) => ({
                views: acc.views + row.views,
                likes: acc.likes + row.likes,
                shares: acc.shares + row.shares,
                comments: acc.comments + row.comments,
                total: acc.total + row.total,
            }),
            { ...EMPTY_TOTALS },
        );

        return {
            rows,
            totals,
            isLoading,
            deployedPortfolioCount: rows.length,
            totalPortfolioCount: portfolios.length,
        };
    }, [portfolios, summariesBySlug, isLoading]);
};
