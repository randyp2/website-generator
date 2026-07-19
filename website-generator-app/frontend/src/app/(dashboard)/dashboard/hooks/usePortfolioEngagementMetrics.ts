"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { exploreQueryKeys } from "@/app/(public)/(site)/explore/explore.query";
import { fetchPortfolioEngagementSummary } from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.api";
import type { PortfolioEngagementSummary } from "@/app/(public)/(site)/explore/[slug]/portfolio-engagement.types";
import type { Portfolio } from "@/types/portfolio";
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

const EMPTY_PORTFOLIOS: Portfolio[] = [];

export const usePortfolioEngagementMetrics = (): PortfolioEngagementMetrics => {
    const { user } = useUser();
    const {
        data: portfolioData,
        isLoading: isPortfolioListLoading,
    } = usePortfolioListQuery(user?.id);
    const portfolios = portfolioData ?? EMPTY_PORTFOLIOS;

    const deployedPortfolios = useMemo(
        () => portfolios.filter(isDeployedPortfolio),
        [portfolios],
    );

    const deployedSlugs = useMemo(
        () =>
            Array.from(
                new Set(
                    deployedPortfolios
                        .map((p) => p.slug?.trim())
                        .filter((slug): slug is string => Boolean(slug)),
                ),
            ),
        [deployedPortfolios],
    );

    const engagementQueries = useQueries({
        queries: deployedSlugs.map((slug) => ({
            queryKey: exploreQueryKeys.engagement(slug),
            queryFn: () => fetchPortfolioEngagementSummary(slug),
        })),
    });

    const summariesBySlug = useMemo(
        () =>
            engagementQueries.reduce<Record<string, PortfolioEngagementSummary>>(
                (summaries, query, index) => {
                    if (query.data) {
                        summaries[deployedSlugs[index]] = query.data;
                    }
                    return summaries;
                },
                {},
            ),
        [deployedSlugs, engagementQueries],
    );

    const isEngagementLoading = engagementQueries.some((query) => query.isPending);

    const isLoading = isPortfolioListLoading || isEngagementLoading;

    return useMemo(() => {
        const rows: PortfolioEngagementRow[] = deployedPortfolios
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
    }, [deployedPortfolios, portfolios.length, summariesBySlug, isLoading]);
};
