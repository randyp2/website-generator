import { ArrowUpRight, CalendarDays, Layers3, Link2 } from "lucide-react"
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

  return (
    <Card className="group overflow-hidden rounded-[1.75rem] border-border bg-card shadow-[0_30px_120px_-60px_rgba(8,145,178,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30">
      <div className="relative p-4 pb-0">
        <PortfolioCardPreview portfolio={portfolio} />
        <div className="pointer-events-none absolute inset-x-8 bottom-4 h-20 bg-gradient-to-t from-card via-card/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-8 bottom-8 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button asChild size="sm" className="rounded-full">
            <Link href={href}>
              Open portfolio
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <div className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            /{portfolio.slug}
          </div>
        </div>
      </div>

      <CardContent className="space-y-5 p-5 pt-5">
        <PortfolioCardOwner
          ownerAvatarUrl={portfolio.ownerAvatarUrl}
          ownerName={portfolio.ownerName}
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
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
            {templateLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border px-3 py-1 text-[11px] text-muted-foreground">
            Published {formatPublishedMonth(portfolio.publishedAt)}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border px-3 py-1 text-[11px] text-muted-foreground">
            Live showcase
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Updated
            </div>
            <p className="text-sm font-medium text-foreground">{publishedLabel}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              Route
            </div>
            <p className="truncate text-sm font-medium text-foreground">/{portfolio.slug}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 border-t border-border px-5 pb-5 pt-0">
        <Button asChild className="h-11 flex-1 rounded-full">
          <Link href={href}>
            View portfolio
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-border bg-background/50 px-4"
        >
          <Link href={href}>
            <Link2 className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
