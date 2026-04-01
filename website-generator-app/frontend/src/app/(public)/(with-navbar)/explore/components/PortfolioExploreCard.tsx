import { ArrowUpRight, Bookmark, Eye, Heart, Layers3, MessageCircle, Share2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

import { PortfolioCardOwner } from "./PortfolioCardOwner"
import { PortfolioCardPreview } from "./PortfolioCardPreview"
import type { PortfolioCard } from "./explore.types"
import {
  formatPublishedDate,
  formatPublishedMonth,
  getPortfolioMetrics,
  getPortfolioSummary,
  getTemplateLabel,
} from "./explore.utils"

interface PortfolioExploreCardProps {
  portfolio: PortfolioCard
}

export const PortfolioExploreCard = ({
  portfolio,
}: PortfolioExploreCardProps) => {
  const href = `/portfolio/${portfolio.slug}`
  const templateLabel = getTemplateLabel(portfolio.templateId)
  const publishedLabel = formatPublishedDate(portfolio.publishedAt)
  const metrics = getPortfolioMetrics(portfolio)

  return (
    <Card className="group overflow-hidden rounded-xl border-border bg-card shadow-[0_24px_80px_-48px_rgba(8,145,178,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
      <div className="relative">
        <PortfolioCardPreview portfolio={portfolio} />
        <div className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button asChild size="sm" className="rounded-lg">
            <Link href={href}>
              Open portfolio
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <div className="rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            /{portfolio.slug}
          </div>
        </div>
      </div>

      <CardContent className="space-y-5 p-4 pt-4">
        <PortfolioCardOwner
          ownerAvatarUrl={portfolio.ownerAvatarUrl}
          ownerName={portfolio.ownerName}
          publishedLabel={publishedLabel}
        />

        <div className="space-y-2">
          <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">
            {portfolio.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {getPortfolioSummary(portfolio)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-md px-3 py-1 text-[11px]">
            {templateLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md border-border px-3 py-1 text-[11px] text-muted-foreground">
            Published {formatPublishedMonth(portfolio.publishedAt)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              Route
            </div>
            <p className="truncate text-sm font-medium text-foreground">/{portfolio.slug}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border px-4 pb-4 pt-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
            <Heart className="h-4 w-4 transition-transform group-hover:scale-100" />
            <span className="text-xs font-medium text-foreground">{metrics.likes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium text-foreground">{metrics.comments}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium text-foreground">{metrics.views}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
            aria-label="Share portfolio"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
            aria-label="Bookmark portfolio"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
