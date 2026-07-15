import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  Share2,
  SquareArrowOutUpRight,
  User,
} from "lucide-react"

import { ExplorePortfolioDescription } from "@/app/(public)/(site)/explore/[slug]/components/ExplorePortfolioDescription"
import { BrowserPreviewFrame } from "@/components/ui/browser-preview-frame"
import type { PublicPortfolioDTO } from "@/types/public-portfolio"

interface ExplorePagePreviewProps {
  portfolio: PublicPortfolioDTO
  browserUrl: string
}

export const ExplorePagePreview = ({
  portfolio,
  browserUrl,
}: ExplorePagePreviewProps) => {
  const ownerName = portfolio.ownerName ?? "Anonymous Creator"

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 sm:p-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="size-3.5" />
            Back to Explore
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
            Portfolio Preview
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {portfolio.title}
            </h2>
            <div
              aria-disabled="true"
              className="inline-flex self-start items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground"
            >
              <SquareArrowOutUpRight className="size-3.5" />
              Open Full Portfolio
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_230px]">
          <div className="min-w-0 space-y-5">
            <BrowserPreviewFrame
              src={portfolio.screenshotUrl}
              alt={`${portfolio.title} preview`}
              url={browserUrl}
              fallback="https://placehold.co/1200x675?text=Portfolio+Preview"
              contentClassName="aspect-video overflow-hidden"
              imageClassName="h-full object-cover object-top"
            />

            <ExplorePortfolioDescription
              portfolio={portfolio}
              linksEnabled={false}
            />
          </div>

          <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Portfolio Details
            </p>
            <div className="mt-4 flex items-center gap-3">
              {portfolio.ownerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portfolio.ownerAvatarUrl}
                  alt={ownerName}
                  className="size-9 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <User className="size-5 text-muted-foreground" />
              )}
              <span className="min-w-0 truncate text-sm font-medium text-foreground">
                {ownerName}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-foreground">
              <Calendar className="size-3.5 text-muted-foreground" />
              Updated <span className="text-primary">just now</span>
            </div>
            <div className="mt-4 h-px bg-border" />
            <div className="mt-4 flex items-center justify-between text-xs text-foreground">
              <span className="flex items-center gap-1.5">
                <Heart className="size-3.5 text-muted-foreground" /> 0
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-muted-foreground" /> 0
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="size-3.5 text-muted-foreground" /> 0
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
