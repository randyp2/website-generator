"use client"

import Link from "next/link"
import { Eye, Heart, MessageCircle } from "lucide-react"

import { LazyImage } from "@/components/ui/lazy-image"

import type { PortfolioCard } from "./explore.types"
import {
  formatPublishedDate,
  getPortfolioInitials,
  getPortfolioMetrics,
  getPortfolioSummary,
  getTemplateLabel,
} from "./explore.utils"

const DEFAULT_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

interface ExploreCardProps {
  portfolio: PortfolioCard
}

export const ExploreCard = ({ portfolio }: ExploreCardProps) => {
  const href = `/explore/${portfolio.slug}`
  const templateLabel = getTemplateLabel(portfolio.templateId)
  const summary = getPortfolioSummary(portfolio)
  const metrics = getPortfolioMetrics(portfolio)

  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-lg p-2 duration-75 hover:bg-accent/60 active:bg-accent"
    >
      <LazyImage
        src={portfolio.screenshotUrl ?? DEFAULT_PREVIEW_IMAGE}
        fallback="https://placehold.co/640x360?text=Portfolio+Preview"
        inView={true}
        alt={portfolio.title}
        ratio={16 / 9}
        className="transition-all duration-500 group-hover:scale-105"
      />
      <div className="space-y-2 px-2 pb-2">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
          <p>{formatPublishedDate(portfolio.publishedAt)}</p>
          <div className="size-1 rounded-full bg-muted-foreground" />
          <p>{templateLabel}</p>
        </div>
        <h2 className="line-clamp-2 text-lg font-semibold leading-5 tracking-tight">
          {portfolio.title}
        </h2>
        <p className="line-clamp-3 text-sm text-muted-foreground">{summary}</p>
        <div className="flex items-end justify-between gap-4 pt-2">
          <div className="flex min-w-0 items-center gap-3">
            {portfolio.ownerAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portfolio.ownerAvatarUrl}
                alt={portfolio.ownerName ?? "Creator"}
                className="size-9 rounded-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {getPortfolioInitials(portfolio.ownerName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {portfolio.ownerName ?? "Anonymous Creator"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {templateLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Heart className="size-4" />
              <span>{metrics.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="size-4" />
              <span>{metrics.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="size-4" />
              <span>{metrics.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
