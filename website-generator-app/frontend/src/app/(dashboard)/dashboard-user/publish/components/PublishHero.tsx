"use client"

import {
  FiCheck,
  FiClock,
  FiCopy,
  FiExternalLink,
  FiEyeOff,
  FiGlobe,
  FiLayers,
  FiZap,
} from "react-icons/fi"

import { BrowserPreviewFrame } from "@/components/ui/browser-preview-frame"
import { buildPortfolioUrl } from "@/lib/public-env"
import { cn } from "@/lib/utils"
import type { Portfolio } from "@/types/portfolio"

import { formatPortfolioDate } from "../../utils/deployedPortfolio"
import {
  PublishHeroViewToggle,
  type PublishHeroViewMode,
} from "./PublishHeroViewToggle"
import { PublishHeroDescriptionPanel } from "./PublishHeroDescriptionPanel"

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

const formatTemplateLabel = (templateId: string | null | undefined): string => {
  if (!templateId || templateId.trim().toLowerCase() === "blank") return "Custom build"
  return templateId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface PublishHeroProps {
  portfolio: Portfolio | null
  liveCount: number
  viewMode: PublishHeroViewMode
  onViewModeChange: (mode: PublishHeroViewMode) => void
  description: string
  copied: boolean
  onCopyUrl: () => void
  onUnpublish: () => void
  onOpenWizard: () => void
  onSaveDescription: (nextDescription: string) => Promise<void>
}

export const PublishHero = ({
  portfolio,
  liveCount,
  viewMode,
  onViewModeChange,
  description,
  copied,
  onCopyUrl,
  onUnpublish,
  onOpenWizard,
  onSaveDescription,
}: PublishHeroProps) => {
  if (!portfolio) {
    return (
      <section className="overflow-hidden rounded-3xl border border-dashed border-border bg-card/40">
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
            <FiGlobe className="h-6 w-6" />
          </span>
          <h2 className="text-xl font-semibold text-foreground">
            No portfolio is live yet
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Pick a draft and walk through the publish flow to put your work on the
            public Explore feed.
          </p>
          <button
            type="button"
            onClick={onOpenWizard}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FiZap className="h-4 w-4" />
            Start the publish flow
          </button>
        </div>
      </section>
    )
  }

  const slug = portfolio.slug?.trim() || null
  const externalUrl = (portfolio.external_url ?? portfolio.externalUrl ?? "").trim()
  const sourceTypeNormalized = (portfolio.source_type ?? portfolio.sourceType ?? "")
    .trim()
    .toLowerCase()
  const isExternalPortfolio =
    sourceTypeNormalized === "external" ||
    (sourceTypeNormalized !== "generated" && externalUrl.length > 0)
  const displayUrl =
    isExternalPortfolio && externalUrl
      ? externalUrl
      : buildPortfolioUrl(slug ?? "pending-slug")
  const livePath =
    isExternalPortfolio && externalUrl
      ? externalUrl
      : slug
        ? `/portfolio/${slug}`
        : "/portfolio/pending-slug"
  const previewSrc = portfolio.screenshot_url ?? DEFAULT_HERO_IMAGE
  const templateLabel = formatTemplateLabel(portfolio.template_id)
  const lastUpdated = formatPortfolioDate(portfolio.updated_at)

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-card/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)]">
      {/* Top eyebrow */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/70 bg-background/40 px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Featured deployment
          </div>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <h1 className="line-clamp-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {portfolio.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[11px] text-muted-foreground">
            {liveCount} {liveCount === 1 ? "portfolio" : "portfolios"} currently live
          </p>
          <PublishHeroViewToggle mode={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      {viewMode === "screenshot" ? (
        <div className="px-6 pt-6">
          <BrowserPreviewFrame
            src={previewSrc}
            alt={`${portfolio.title} screenshot`}
            url={displayUrl}
            className="rounded-2xl"
          />
        </div>
      ) : (
        <PublishHeroDescriptionPanel
          title={portfolio.title}
          description={description}
          onSaveDescription={onSaveDescription}
        />
      )}

      {/* Deployment bar */}
      <div className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
              <FiGlobe className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Public URL
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-foreground">
                {displayUrl}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
              <FiLayers className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Template
              </p>
              <p className="mt-0.5 truncate text-sm text-foreground">
                {templateLabel}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
              <FiClock className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Last deployed
              </p>
              <p className="mt-0.5 truncate text-sm text-foreground">{lastUpdated}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            onClick={onCopyUrl}
            disabled={!slug}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted",
              !slug && "cursor-not-allowed opacity-40",
            )}
          >
            {copied ? (
              <FiCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <FiCopy className="h-4 w-4" />
            )}
            Copy URL
          </button>
          {slug && (
            <a
              href={livePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FiExternalLink className="h-4 w-4" />
              Open live
            </a>
          )}
          <button
            type="button"
            onClick={onUnpublish}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-red-500/35 hover:text-red-400"
          >
            <FiEyeOff className="h-4 w-4" />
            Unpublish
          </button>
          <button
            type="button"
            onClick={onOpenWizard}
            className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FiZap className="h-4 w-4" />
            Publish new
          </button>
        </div>
      </div>
    </section>
  )
}
