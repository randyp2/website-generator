"use client";

import React from "react";
import {
    Activity,
    BarChart3,
    Check,
    ChevronDown,
    Clock,
    Copy,
    ExternalLink,
    Globe,
    Info,
    LayoutTemplate,
} from "lucide-react";
import type { Portfolio } from "@/types/portfolio";
import type { UserData } from "@/context/UserContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
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
    const [activeTab, setActiveTab] = React.useState<"details" | "analytics">("details");
    const [copied, setCopied] = React.useState(false);

    const handleCopyUrl = React.useCallback(async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            // clipboard unavailable — silently no-op
        }
    }, []);

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
        : buildPortfolioUrl(slug || "tbd-slug", createdBy);
    const lastUpdated = formatPortfolioDate(deployedPortfolio.updated_at);
    const normalizedStatus = normalizeStatus(deployedPortfolio.status);

    const tabs: Array<{ key: "details" | "analytics"; label: string; icon: typeof Info }> = [
        { key: "details", label: "Details", icon: Info },
        { key: "analytics", label: "Analytics", icon: BarChart3 },
    ];

    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Current Deployed Portfolio</h3>
                <div
                    role="tablist"
                    aria-label="Portfolio view"
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
                                    isActive
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:items-stretch">
                <div className="flex flex-col overflow-hidden rounded-3xl border border-[#32353d] bg-[#1f2128] shadow-lg shadow-black/20">
                    <div className="flex items-center gap-2 border-b border-[#32353d] bg-[#2a2d35] px-3 py-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                        <div className="ml-2 min-w-0 flex-1 rounded-full border border-[#3a3f49] bg-[#17191f] px-3 py-1">
                            <p className="truncate text-xs text-white/75">{browserUrl}</p>
                        </div>
                    </div>

                    <div className="relative aspect-[16/10] w-full">
                        <div
                            className="absolute inset-0 bg-cover bg-top"
                            style={{ backgroundImage: `url(${deployedPortfolio.screenshot_url ?? DEFAULT_DEPLOYED_PORTFOLIO_IMAGE})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3">
                            <p className="truncate text-sm font-semibold text-white">
                                {deployedPortfolio.title ?? "Untitled Portfolio"}
                            </p>
                        </div>
                    </div>
                </div>

                {activeTab === "details" ? (
                    <article
                        role="tabpanel"
                        aria-label="Portfolio details"
                        className="flex flex-col rounded-2xl border border-border bg-card/80 p-4 md:p-5"
                    >
                        <dl className="grid grid-cols-2 gap-3">
                            {deployedPortfolios.length > 1 ? (
                                <div className="col-span-2 space-y-1.5">
                                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        <LayoutTemplate className="h-3.5 w-3.5" />
                                        Dashboard Portfolio
                                    </dt>
                                    <dd>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="group flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-background focus:border-primary focus:outline-none data-[state=open]:border-primary data-[state=open]:bg-background"
                                                >
                                                    <span className="truncate text-left">
                                                        {deployedPortfolio.title?.trim() || "Untitled Portfolio"}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="start"
                                                sideOffset={6}
                                                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[14rem] max-h-64 overflow-y-auto"
                                            >
                                                <DropdownMenuRadioGroup
                                                    value={String(deployedPortfolio.id)}
                                                    onValueChange={setSelectedPortfolioId}
                                                >
                                                    {deployedPortfolios.map((portfolio) => (
                                                        <DropdownMenuRadioItem
                                                            key={String(portfolio.id)}
                                                            value={String(portfolio.id)}
                                                            className="cursor-pointer"
                                                        >
                                                            <span className="truncate">
                                                                {portfolio.title?.trim() || "Untitled Portfolio"}
                                                            </span>
                                                        </DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </dd>
                                </div>
                            ) : null}

                            <div className="col-span-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                                <dt className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    <Globe className="h-3.5 w-3.5" />
                                    URL
                                </dt>
                                <dd className="text-sm text-foreground">
                                    <a
                                        href={browserUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex max-w-full items-center gap-1.5 font-medium text-foreground transition hover:text-primary"
                                    >
                                        <span className="truncate break-all">{browserUrl}</span>
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    </a>
                                </dd>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                                <dt className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    Last Updated
                                </dt>
                                <dd className="truncate text-sm font-medium text-foreground">{lastUpdated}</dd>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                                <dt className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    <Activity className="h-3.5 w-3.5" />
                                    Status
                                </dt>
                                <dd>
                                    <StatusIndicator status={normalizedStatus} />
                                </dd>
                            </div>

                            <div className="col-span-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                                <dt className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    <LayoutTemplate className="h-3.5 w-3.5" />
                                    Template
                                </dt>
                                <dd className="truncate text-sm font-medium text-foreground">
                                    {formatTemplateLabel(deployedPortfolio.template_id)}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-auto flex flex-wrap gap-2 pt-4">
                            <a
                                href={browserUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Visit Site
                            </a>
                            <button
                                type="button"
                                onClick={() => handleCopyUrl(browserUrl)}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-background"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy URL
                                    </>
                                )}
                            </button>
                        </div>
                    </article>
                ) : (
                    <div role="tabpanel" aria-label="Portfolio analytics" className="flex">
                        <PublishedPortfolioAnalytics />
                    </div>
                )}
            </div>
        </section>
    );
};
