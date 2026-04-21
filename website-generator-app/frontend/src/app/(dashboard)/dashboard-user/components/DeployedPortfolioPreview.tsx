"use client";

import React from "react";
import type { Portfolio } from "@/types/portfolio";
import type { UserData } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildPortfolioUrl } from "@/lib/public-env";
import {
    DEFAULT_DEPLOYED_PORTFOLIO_IMAGE,
    formatFieldValue,
    formatPortfolioDate,
    isDeployedPortfolio,
} from "../utils/deployedPortfolio";
import { normalizeStatus } from "../utils/portfolioUtils";
import { PublishedPortfolioAnalytics } from "./PublishedPortfolioAnalytics";
import { StatusIndicator } from "./StatusIndicator";

type DeployedPortfolioPreviewProps = {
    portfolios: Portfolio[];
    isLoading: boolean;
    user?: UserData | null;
};

const PreviewSkeleton: React.FC = () => (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/80 p-4 md:p-5">
        <div className="animate-pulse space-y-3">
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="h-40 rounded-xl bg-muted" />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
            </div>
        </div>
    </div>
);

const formatTemplateLabel = (value?: string | null): string => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized || normalized === "blank") return "Custom";
    return formatFieldValue(value);
};

const getInitials = (value: string): string =>
    value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U";

export const DeployedPortfolioPreview: React.FC<DeployedPortfolioPreviewProps> = ({
    portfolios,
    isLoading,
    user,
}) => {
    const deployedPortfolios = React.useMemo(
        () => portfolios.filter(isDeployedPortfolio),
        [portfolios],
    );
    const [selectedPortfolioId, setSelectedPortfolioId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (deployedPortfolios.length === 0) {
            setSelectedPortfolioId(null);
            return;
        }

        const hasSelectedPortfolio = deployedPortfolios.some(
            (portfolio) => portfolio.id === selectedPortfolioId,
        );

        if (!hasSelectedPortfolio) {
            setSelectedPortfolioId(String(deployedPortfolios[0].id));
        }
    }, [deployedPortfolios, selectedPortfolioId]);

    const deployedPortfolio =
        deployedPortfolios.find((portfolio) => String(portfolio.id) === selectedPortfolioId) ??
        deployedPortfolios[0] ??
        null;

    if (isLoading) return <PreviewSkeleton />;

    if (!deployedPortfolio) {
        return (
            <div className="rounded-2xl border border-border bg-card/80 p-4 md:p-5">
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Current Deployed Portfolio</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    No active or published portfolio found yet. Publish one to show a live preview here.
                </p>
            </div>
        );
    }

    const createdBy = user?.username?.trim() || user?.email?.trim() || "TBD (schema placeholder)";
    const avatarUrl = typeof user?.avatar === "string" ? user.avatar.trim() : "";
    const slug = deployedPortfolio.slug?.trim();
    const externalUrl = (deployedPortfolio.external_url ?? deployedPortfolio.externalUrl ?? "").trim();
    const sourceTypeNormalized = (deployedPortfolio.source_type ?? deployedPortfolio.sourceType ?? "")
        .trim()
        .toLowerCase();
    const isExternalDeployed =
        sourceTypeNormalized === "external" ||
        (sourceTypeNormalized !== "generated" && externalUrl.length > 0);
    const browserUrl = isExternalDeployed && externalUrl
        ? externalUrl
        : buildPortfolioUrl(slug || "tbd-slug");
    const publicRoute = isExternalDeployed && externalUrl
        ? externalUrl
        : `/portfolio/${slug || "tbd-slug"}`;
    const lastUpdated = formatPortfolioDate(deployedPortfolio.updated_at);
    const normalizedStatus = normalizeStatus(deployedPortfolio.status);

    return (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
            <div className="flex h-full flex-col gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Current Deployed Portfolio</h3>
                <article className="flex-1 overflow-hidden rounded-2xl border border-border bg-card/80 p-4 md:p-5">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[480px_minmax(0,1fr)] lg:items-start">
                        <div className="overflow-hidden rounded-xl border border-[#32353d] bg-[#1f2128]">
                            <div className="flex items-center gap-2 border-b border-[#32353d] bg-[#2a2d35] px-3 py-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                                <div className="ml-2 min-w-0 flex-1 rounded-full border border-[#3a3f49] bg-[#17191f] px-3 py-1">
                                    <p className="truncate text-xs text-white/75">{browserUrl}</p>
                                </div>
                            </div>

                            <div className="relative h-72">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${deployedPortfolio.screenshot_url ?? DEFAULT_DEPLOYED_PORTFOLIO_IMAGE})` }}
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
                                <div className="space-y-1">
                                    <dt className="text-sm font-semibold text-muted-foreground">Created By:</dt>
                                    <dd className="flex items-center gap-3 break-words text-sm text-foreground">
                                        <Avatar className="h-8 w-8 border border-border/60">
                                            <AvatarImage src={avatarUrl || undefined} alt={`${createdBy} avatar`} />
                                            <AvatarFallback className="text-xs font-semibold text-foreground">
                                                {getInitials(createdBy)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{createdBy}</span>
                                    </dd>
                                </div>

                                <div className="space-y-1">
                                    <dt className="text-sm font-semibold text-muted-foreground">Date Created:</dt>
                                    <dd className="break-words text-sm text-foreground">
                                        {formatPortfolioDate(deployedPortfolio.created_at)}
                                    </dd>
                                </div>

                                <div className="space-y-1">
                                    <dt className="text-sm font-semibold text-muted-foreground">Status:</dt>
                                    <dd className="break-words text-sm text-foreground">
                                        <StatusIndicator status={normalizedStatus} />
                                    </dd>
                                </div>

                                <div className="space-y-1">
                                    <dt className="text-sm font-semibold text-muted-foreground">Template:</dt>
                                    <dd className="break-words text-sm text-foreground">
                                        {formatTemplateLabel(deployedPortfolio.template_id)}
                                    </dd>
                                    {deployedPortfolios.length > 1 ? (
                                        <div className="pt-2">
                                            <label
                                                htmlFor="dashboard-published-portfolio-select"
                                                className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                                            >
                                                Dashboard Portfolio
                                            </label>
                                            <select
                                                id="dashboard-published-portfolio-select"
                                                value={String(deployedPortfolio.id)}
                                                onChange={(event) => setSelectedPortfolioId(event.target.value)}
                                                className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                                            >
                                                {deployedPortfolios.map((portfolio) => (
                                                    <option key={String(portfolio.id)} value={String(portfolio.id)}>
                                                        {portfolio.title?.trim() || "Untitled Portfolio"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : null}
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-border pt-4">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground">
                            <p className="flex items-center gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">URL:</span>
                                <span className="break-all text-foreground">{browserUrl}</span>
                            </p>
                            <p className="flex items-center gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Public route:</span>
                                <span className="break-all text-foreground">{publicRoute}</span>
                            </p>
                            <p className="flex items-center gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Last updated:</span>
                                <span className="text-foreground">{lastUpdated}</span>
                            </p>
                        </div>
                    </div>
                </article>
            </div>

            <div className="flex h-full w-full flex-col gap-2 xl:justify-self-end">
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Portfolio Analytics</h3>
                <PublishedPortfolioAnalytics />
            </div>
        </section>
    );
};
