"use client"

import { FiGlobe } from "react-icons/fi"

import type { Portfolio } from "@/types/portfolio"

import { PublishListCard } from "./PublishListCard"

interface PublishLiveColumnProps {
  live: Portfolio[]
  ownerName: string
  featuredPortfolioId: string | null
  copiedSlug: string | null
  onSelectFeatured: (portfolioId: string) => void
  onCopyUrl: (slug: string, externalUrl?: string | null) => void
  onUnpublish: (portfolioId: string) => void
}

export const PublishLiveColumn = ({
  live,
  ownerName,
  featuredPortfolioId,
  copiedSlug,
  onSelectFeatured,
  onCopyUrl,
  onUnpublish,
}: PublishLiveColumnProps) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">
        Live — currently deployed
      </h2>
      <span className="text-xs text-muted-foreground">{live.length}</span>
    </div>
    {live.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
        <FiGlobe className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Nothing is live yet
        </p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Publish a draft to see it featured here.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {live.map((portfolio) => {
          const portfolioId = String(portfolio.id)
          const slug = portfolio.slug ?? null
          const externalUrl =
            (portfolio.external_url ?? portfolio.externalUrl ?? null)?.trim() || null
          return (
            <PublishListCard
              key={portfolioId}
              portfolio={portfolio}
              variant="live"
              ownerName={ownerName}
              isFeatured={portfolioId === featuredPortfolioId}
              copied={copiedSlug !== null && copiedSlug === slug}
              onClick={() => onSelectFeatured(portfolioId)}
              onCopyUrl={() => slug && onCopyUrl(slug, externalUrl)}
              onUnpublish={() => onUnpublish(portfolioId)}
            />
          )
        })}
      </div>
    )}
  </section>
)
