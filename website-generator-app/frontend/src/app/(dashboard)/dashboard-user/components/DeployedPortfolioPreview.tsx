"use client";

import React from "react";
import type { Portfolio } from "@/types/portfolio";
import type { UserData } from "@/context/UserContext";
import {
    DEFAULT_DEPLOYED_PORTFOLIO_IMAGE,
    formatFieldValue,
    formatPortfolioDate,
    getFirstDeployedPortfolio,
} from "../utils/deployedPortfolio";
import { PublishedPortfolioAnalytics } from "./PublishedPortfolioAnalytics";

type DeployedPortfolioPreviewProps = {
    portfolios: Portfolio[];
    isLoading: boolean;
    user?: UserData | null;
};

const PreviewSkeleton: React.FC = () => (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="animate-pulse space-y-3">
            <div className="h-5 w-48 rounded bg-white/10" />
            <div className="h-40 rounded-xl bg-white/10" />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="h-10 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
            </div>
        </div>
    </div>
);

export const DeployedPortfolioPreview: React.FC<DeployedPortfolioPreviewProps> = ({
    portfolios,
    isLoading,
    user,
}) => {
    if (isLoading) return <PreviewSkeleton />;

    const deployedPortfolio = getFirstDeployedPortfolio(portfolios);

    if (!deployedPortfolio) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
                <h3 className="text-lg md:text-xl font-semibold text-white">Current Deployed Portfolio</h3>
                <p className="mt-2 text-sm text-white/65">
                    No active or published portfolio found yet. Publish one to show a live preview here.
                </p>
            </div>
        );
    }

    const createdBy = user?.username?.trim() || user?.email?.trim() || "TBD (schema placeholder)";
    const slug = deployedPortfolio.slug?.trim();
    const browserUrl = `https://portrn/${slug || "tbd-slug"}`;
    const publicRoute = `/portfolio/${slug || "tbd-slug"}`;
    const metadata = [
        { label: "Created By:", value: createdBy },
        { label: "Date Created:", value: formatPortfolioDate(deployedPortfolio.created_at) },
        { label: "Status:", value: formatFieldValue(deployedPortfolio.status) },
        { label: "Template:", value: formatFieldValue(deployedPortfolio.template_id) },
    ];
    const lastUpdated = formatPortfolioDate(deployedPortfolio.updated_at);

    return (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
            <div className="flex h-full flex-col gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-white">Current Deployed Portfolio</h3>
                <article className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[480px_minmax(0,1fr)] lg:items-start">
                        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b111c]">
                            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                <div className="ml-2 min-w-0 flex-1 rounded-full border border-white/15 bg-[#070b14] px-3 py-1">
                                    <p className="truncate text-xs text-white/75">{browserUrl}</p>
                                </div>
                            </div>

                            <div className="relative h-72">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${DEFAULT_DEPLOYED_PORTFOLIO_IMAGE})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                                <div className="absolute inset-x-0 bottom-0 p-3">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {deployedPortfolio.title ?? "Untitled Portfolio"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <dl className="flex flex-col gap-5">
                                {metadata.map((item) => (
                                    <div key={item.label} className="space-y-1">
                                        <dt className="text-sm font-semibold text-white/65">{item.label}</dt>
                                        <dd className="break-words text-sm text-white/90">{item.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                            <p className="flex items-center gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">URL:</span>
                                <span className="break-all text-white/90">{browserUrl}</span>
                            </p>
                            <p className="flex items-center gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Public route:</span>
                                <span className="break-all text-white/90">{publicRoute}</span>
                            </p>
                            <p className="flex items-center gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Last updated:</span>
                                <span className="text-white/90">{lastUpdated}</span>
                            </p>
                        </div>
                    </div>
                </article>
            </div>

            <div className="flex h-full w-full flex-col gap-2 xl:justify-self-end">
                <h3 className="text-lg md:text-xl font-semibold text-white">Portfolio Analytics</h3>
                <PublishedPortfolioAnalytics />
            </div>
        </section>
    );
};
