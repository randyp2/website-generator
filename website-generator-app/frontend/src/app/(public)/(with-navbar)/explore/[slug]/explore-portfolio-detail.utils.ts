import type {
  ExplorePortfolioDetail,
  ExplorePortfolioMetrics,
  TimeAgoParts,
} from "./explore-portfolio-detail.types";

export const DEFAULT_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const TIME_UNITS = {
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
  month: 1000 * 60 * 60 * 24 * 30,
  year: 1000 * 60 * 60 * 24 * 365,
} as const;

const hashString = (value: string): number =>
  value.split("").reduce((accumulator, character) => accumulator * 31 + character.charCodeAt(0), 7);

const toTitleCase = (value: string): string =>
  value.replace(/\b\w/g, (character) => character.toUpperCase());

const formatPluralizedTime = (value: number, unit: string): string =>
  `${value} ${unit}${value === 1 ? "" : "s"} ago`;

const stripMarkdown = (value: string): string =>
  value
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toExcerpt = (value: string, maxLength = 220): string => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

export const formatTimeAgo = (iso: string): string => {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < TIME_UNITS.hour) {
    const minutes = Math.max(1, Math.floor(diffMs / TIME_UNITS.minute));
    return formatPluralizedTime(minutes, "minute");
  }

  if (diffMs < TIME_UNITS.day) {
    const hours = Math.floor(diffMs / TIME_UNITS.hour);
    return formatPluralizedTime(hours, "hour");
  }

  if (diffMs < TIME_UNITS.month) {
    const days = Math.floor(diffMs / TIME_UNITS.day);
    return formatPluralizedTime(days, "day");
  }

  if (diffMs < TIME_UNITS.year) {
    const months = Math.floor(diffMs / TIME_UNITS.month);
    return formatPluralizedTime(months, "month");
  }

  const years = Math.floor(diffMs / TIME_UNITS.year);
  return formatPluralizedTime(years, "year");
};

export const splitTimeAgo = (value: string): TimeAgoParts => {
  const suffix = " ago";

  if (!value.endsWith(suffix)) {
    return {
      metric: value,
      suffix: "",
    };
  }

  return {
    metric: value.slice(0, -suffix.length),
    suffix,
  };
};

export const getTemplateLabel = (templateId: string | null): string =>
  templateId ? toTitleCase(templateId.replace(/[-_]+/g, " ")) : "Custom Build";

export const getPortfolioMetrics = (slug: string): ExplorePortfolioMetrics => {
  const seed = Math.abs(hashString(slug));

  return {
    likes: 120 + (seed % 780),
    shares: 12 + (seed % 140),
    views: 900 + (seed % 9100),
  };
};

export const getPortfolioOwnerName = (portfolio: ExplorePortfolioDetail): string =>
  portfolio.ownerName ?? "Anonymous Creator";

export const isExternalExplorePortfolio = (portfolio: ExplorePortfolioDetail): boolean => {
  const normalizedSource = (portfolio.sourceType ?? "").trim().toLowerCase();
  if (normalizedSource === "external") return true;
  if (normalizedSource === "generated") return false;
  return Boolean(portfolio.externalUrl && portfolio.externalUrl.trim().length > 0);
};

export const getPortfolioFullHref = (portfolio: ExplorePortfolioDetail): string => {
  if (isExternalExplorePortfolio(portfolio) && portfolio.externalUrl) {
    return portfolio.externalUrl;
  }
  return `/portfolio/${portfolio.slug}`;
};

export const getPortfolioDescriptionSnippet = (
  portfolio: ExplorePortfolioDetail,
  maxLength = 220,
): string => {
  const rawDescription = portfolio.description?.trim();
  if (rawDescription) {
    const plainDescription = stripMarkdown(rawDescription);
    if (plainDescription) return toExcerpt(plainDescription, maxLength);
  }

  const ownerName = portfolio.ownerName ?? "an independent creator";
  return `Preview ${portfolio.title} by ${ownerName} before opening the full portfolio.`;
};

export const getPortfolioDescription = (portfolio: ExplorePortfolioDetail): string[] => {
  const templateLabel = getTemplateLabel(portfolio.templateId).toLowerCase();
  const ownerName = getPortfolioOwnerName(portfolio);

  return [
    `${portfolio.title} is presented as a ${templateLabel} portfolio by ${ownerName}. This section is intentionally structured like a portfolio summary mockup, with room for a short positioning statement, project context, and the kind of work this creator wants to highlight most.`,
    "Replace this placeholder copy with a real narrative about the creator, the audience they want to reach, and the proof points that make the portfolio worth exploring. For now, it gives the explore page a clean intermediate step between the gallery card and the live portfolio.",
  ];
};
