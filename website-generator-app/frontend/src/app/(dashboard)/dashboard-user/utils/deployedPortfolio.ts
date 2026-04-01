import type { Portfolio } from "@/types/portfolio";

export const DEFAULT_DEPLOYED_PORTFOLIO_IMAGE =
    "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const DEPLOYED_STATUSES = new Set(["active", "publish", "published"]);
const MISSING_FIELD_PLACEHOLDER = "TBD (schema placeholder)";

export const isDeployedPortfolio = (portfolio: Portfolio): boolean =>
    DEPLOYED_STATUSES.has((portfolio.status ?? "").toLowerCase().trim());

export const getFirstDeployedPortfolio = (
    portfolios: Portfolio[],
): Portfolio | null => portfolios.find(isDeployedPortfolio) ?? null;

export const formatPortfolioDate = (timestamp?: string | null): string => {
    if (!timestamp) return MISSING_FIELD_PLACEHOLDER;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return MISSING_FIELD_PLACEHOLDER;
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatFieldValue = (
    value: string | null | undefined,
): string => value?.trim() || MISSING_FIELD_PLACEHOLDER;
