import { Eye, Heart, MessageCircle } from "lucide-react"

import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types"
import {
  formatPublishedDate,
  getPortfolioInitials,
  getPortfolioSummary,
  getTemplateLabel,
} from "@/app/(public)/(site)/explore/components/explore.utils"
import { LazyImage } from "@/components/ui/lazy-image"

interface ExploreCardPreviewProps {
  portfolio: PortfolioCard
}

export const ExploreCardPreview = ({ portfolio }: ExploreCardPreviewProps) => {
  const ownerName = portfolio.ownerName ?? "Anonymous Creator"

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 sm:p-5">
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-border bg-card/40 p-1">
          <div className="group relative flex flex-col gap-2 rounded-lg p-2">
            <LazyImage
              src={portfolio.screenshotUrl ?? ""}
              fallback="https://placehold.co/640x360?text=Portfolio+Preview"
              inView={true}
              alt={portfolio.title}
              ratio={16 / 9}
              className="object-cover object-top"
            />
            <div className="space-y-2 px-2 pb-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                <p>{formatPublishedDate(portfolio.publishedAt)}</p>
                <div className="size-1 rounded-full bg-muted-foreground" />
                <p>{getTemplateLabel(portfolio.templateId)}</p>
              </div>
              <h2 className="line-clamp-2 text-lg font-semibold leading-5 tracking-tight">
                {portfolio.title}
              </h2>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {getPortfolioSummary(portfolio)}
              </p>
              <div className="flex items-end justify-between gap-4 pt-2">
                <div className="flex min-w-0 items-center gap-3">
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
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {getPortfolioInitials(ownerName)}
                    </div>
                  )}
                  <p className="min-w-0 truncate text-sm font-medium text-foreground">
                    {ownerName}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className="size-4" /> 0
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-4" /> 0
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" /> 0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
