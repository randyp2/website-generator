import { Portfolio } from "@/types/portfolio";

export const formatRelativeTime = (timestamp?: unknown | null): string => {
    if (!timestamp) return "Just now";
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp as string);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

export const normalizeStatus = (status?: string | null): "active" | "draft" | "archived" => {
    if (status === "archived") return "archived";
    if (status === "active" || status === "publish" || status === "published") return "active";
    return "draft";
};

export const resolveResumePath = (portfolio: Portfolio): string => {
    const step = portfolio.last_step ?? "refine";
    if (step === "template") return `/dashboard/create/style?portfolioId=${portfolio.id}`;
    if (step === "style") return `/dashboard/create/style?portfolioId=${portfolio.id}`;
    if (step === "upload") return `/dashboard/create/upload?portfolioId=${portfolio.id}`;
    if (step === "review") return `/dashboard/create/review?portfolioId=${portfolio.id}`;
    return `/dashboard/create/refine?portfolioId=${portfolio.id}`;
};

export const getDateValue = (timestamp?: unknown | null): number => {
    if (!timestamp) return 0;
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp as string);
    const value = date.getTime();
    return Number.isNaN(value) ? 0 : value;
};
