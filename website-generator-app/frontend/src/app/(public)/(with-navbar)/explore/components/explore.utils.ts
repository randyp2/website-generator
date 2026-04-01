import type { PortfolioCard } from "./explore.types"

interface PreviewPalette {
  shellClassName: string
  glowClassName: string
  accentClassName: string
  tintClassName: string
}

const PREVIEW_PALETTES: PreviewPalette[] = [
  {
    shellClassName:
      "bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.42),_transparent_42%),linear-gradient(135deg,#1b140d_0%,#0f172a_52%,#020617_100%)]",
    glowClassName: "shadow-[0_35px_100px_-55px_rgba(249,115,22,0.72)]",
    accentClassName: "from-orange-300/90 via-amber-200/90 to-rose-200/80",
    tintClassName: "border-orange-200/25 bg-orange-200/10 text-orange-50",
  },
  {
    shellClassName:
      "bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.33),_transparent_44%),linear-gradient(135deg,#07131f_0%,#10243a_50%,#040816_100%)]",
    glowClassName: "shadow-[0_35px_100px_-55px_rgba(34,211,238,0.72)]",
    accentClassName: "from-cyan-200/90 via-sky-200/85 to-indigo-200/80",
    tintClassName: "border-cyan-200/25 bg-cyan-200/10 text-cyan-50",
  },
  {
    shellClassName:
      "bg-[radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.36),_transparent_42%),linear-gradient(135deg,#061a17_0%,#10222b_48%,#030712_100%)]",
    glowClassName: "shadow-[0_35px_100px_-55px_rgba(52,211,153,0.72)]",
    accentClassName: "from-emerald-200/90 via-teal-200/80 to-lime-200/75",
    tintClassName: "border-emerald-200/25 bg-emerald-200/10 text-emerald-50",
  },
  {
    shellClassName:
      "bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.28),_transparent_42%),linear-gradient(135deg,#14091f_0%,#1a1335_46%,#050816_100%)]",
    glowClassName: "shadow-[0_35px_100px_-55px_rgba(168,85,247,0.7)]",
    accentClassName: "from-fuchsia-200/90 via-violet-200/85 to-blue-200/80",
    tintClassName: "border-fuchsia-200/25 bg-fuchsia-200/10 text-fuchsia-50",
  },
]

const toTitleCase = (value: string): string =>
  value.replace(/\b\w/g, (char) => char.toUpperCase())

const hashString = (value: string): number =>
  value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7)

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

export const getPortfolioPalette = (portfolio: PortfolioCard): PreviewPalette => {
  const index = Math.abs(hashString(`${portfolio.slug}:${portfolio.templateId ?? "custom"}`)) % PREVIEW_PALETTES.length
  return PREVIEW_PALETTES[index]
}

export const getPortfolioSummary = (portfolio: PortfolioCard): string => {
  const templateLabel = getTemplateLabel(portfolio.templateId)
  const ownerLabel = portfolio.ownerName ?? "an independent creator"

  return `${templateLabel} portfolio published by ${ownerLabel}.`
}

export const matchesPortfolioFilter = (
  portfolio: PortfolioCard,
  activeFilter: "all" | "templated" | "recent",
  searchQuery: string,
): boolean => {
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const matchesSearch =
    normalizedQuery.length === 0 ||
    portfolio.title.toLowerCase().includes(normalizedQuery) ||
    portfolio.slug.toLowerCase().includes(normalizedQuery) ||
    (portfolio.ownerName ?? "").toLowerCase().includes(normalizedQuery) ||
    getTemplateLabel(portfolio.templateId).toLowerCase().includes(normalizedQuery)

  if (!matchesSearch) return false
  if (activeFilter === "all") return true
  if (activeFilter === "templated") return Boolean(portfolio.templateId)

  const publishedAt = new Date(portfolio.publishedAt).getTime()
  const recentWindowMs = 1000 * 60 * 60 * 24 * 45

  return Date.now() - publishedAt <= recentWindowMs
}
