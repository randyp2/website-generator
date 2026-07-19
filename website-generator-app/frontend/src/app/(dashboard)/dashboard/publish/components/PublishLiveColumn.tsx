"use client"

import { FiGlobe } from "react-icons/fi"

import type { Portfolio } from "@/types/portfolio"

import { PublishLiveDeck } from "./PublishLiveDeck"

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
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
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
      <PublishLiveDeck
        live={live}
        ownerName={ownerName}
        featuredPortfolioId={featuredPortfolioId}
        copiedSlug={copiedSlug}
        onSelectFeatured={onSelectFeatured}
        onCopyUrl={onCopyUrl}
        onUnpublish={onUnpublish}
      />
    )}
  </section>
)
