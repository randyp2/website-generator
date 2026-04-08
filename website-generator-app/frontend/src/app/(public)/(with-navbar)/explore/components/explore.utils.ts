import type { PortfolioCard } from "./explore.types"

const toTitleCase = (value: string): string =>
  value.replace(/\b\w/g, (char) => char.toUpperCase())

const hashString = (value: string): number =>
  value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7)

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
    .trim()

const toExcerpt = (value: string, maxLength = 220): string => {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

export const getPortfolioInitials = (name: string | null): string => {
  if (!name) return "PC"

  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export const formatPublishedDate = (iso: string): string => {
  const date = new Date(iso)

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const formatPublishedMonth = (iso: string): string => {
  const date = new Date(iso)

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

export const getTemplateLabel = (templateId: string | null): string =>
  templateId ? toTitleCase(templateId.replace(/[-_]+/g, " ")) : "Custom Build"

export const getPortfolioSummary = (portfolio: PortfolioCard): string => {
  const rawDescription = portfolio.description?.trim()
  if (rawDescription) {
    const plainDescription = stripMarkdown(rawDescription)
    if (plainDescription) return toExcerpt(plainDescription)
  }

  const templateLabel = getTemplateLabel(portfolio.templateId)
  const ownerLabel = portfolio.ownerName ?? "an independent creator"

  return `${templateLabel} portfolio published by ${ownerLabel}.`
}

export const getPortfolioMetrics = (portfolio: PortfolioCard) => {
  const seed = Math.abs(hashString(portfolio.slug))

  return {
    likes: 120 + (seed % 780),
    comments: 8 + (seed % 92),
    views: 900 + (seed % 9100),
  }
}

export const matchesPortfolioFilter = (
  portfolio: PortfolioCard,
  activeFilter: "all" | "templated" | "recent",
  searchQuery: string,
): boolean => {
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const normalizedDescription = stripMarkdown(portfolio.description ?? "").toLowerCase()
  const matchesSearch =
    normalizedQuery.length === 0 ||
    portfolio.title.toLowerCase().includes(normalizedQuery) ||
    portfolio.slug.toLowerCase().includes(normalizedQuery) ||
    normalizedDescription.includes(normalizedQuery) ||
    (portfolio.ownerName ?? "").toLowerCase().includes(normalizedQuery) ||
    getTemplateLabel(portfolio.templateId).toLowerCase().includes(normalizedQuery)

  if (!matchesSearch) return false
  if (activeFilter === "all") return true
  if (activeFilter === "templated") return Boolean(portfolio.templateId)

  const publishedAt = new Date(portfolio.publishedAt).getTime()
  const recentWindowMs = 1000 * 60 * 60 * 24 * 45

  return Date.now() - publishedAt <= recentWindowMs
}
