"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import type { Portfolio } from "@/types/portfolio";
import { fetchPortfolioEngagementSummary } from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.api";
import type { PortfolioEngagementSummary } from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.types";
import { isDeployedPortfolio } from "../utils/deployedPortfolio";

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
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [summariesBySlug, setSummariesBySlug] = useState<Record<string, PortfolioEngagementSummary>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        const userId = user?.id;
        if (!userId) {
            setPortfolios([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const loadAll = async () => {
            try {
                const response = await fetch(`/api/portfolio/list?userId=${userId}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                const rows: Portfolio[] = Array.isArray(data?.portfolios) ? data.portfolios : [];
                if (cancelled) return;
                setPortfolios(rows);

                const deployedWithSlug = rows
                    .filter(isDeployedPortfolio)
                    .map((p) => p.slug?.trim())
                    .filter((slug): slug is string => Boolean(slug));

                if (deployedWithSlug.length === 0) {
                    setSummariesBySlug({});
                    return;
                }

                const results = await Promise.allSettled(
                    deployedWithSlug.map((slug) => fetchPortfolioEngagementSummary(slug)),
                );

                if (cancelled) return;
                const next: Record<string, PortfolioEngagementSummary> = {};
                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        next[deployedWithSlug[index]] = result.value;
                    }
                });
                setSummariesBySlug(next);
            } catch {
                if (!cancelled) {
                    setPortfolios([]);
                    setSummariesBySlug({});
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadAll();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

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
