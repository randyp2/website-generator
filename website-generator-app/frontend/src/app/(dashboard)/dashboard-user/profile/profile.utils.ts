import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types"

import type { ApiPortfolio } from "./profile.types"

export const mapApiPortfolioToCard = (
  portfolio: ApiPortfolio,
  ownerName: string | null,
  ownerAvatarUrl: string | null,
): PortfolioCard => ({
  title: portfolio.title,
  slug: portfolio.slug ?? portfolio.id,
  templateId: portfolio.template_id ?? null,
  description: portfolio.description ?? null,
  ownerName,
  ownerAvatarUrl,
  publishedAt:
    portfolio.updated_at ?? portfolio.created_at ?? new Date().toISOString(),
  screenshotUrl: portfolio.screenshot_url ?? null,
  sourceType: portfolio.source_type ?? null,
  externalUrl: portfolio.external_url ?? null,
})
