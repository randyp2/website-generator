"use client"

import { useState } from "react"
import {
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiEyeOff,
  FiImage,
  FiStar,
} from "react-icons/fi"

import { buildPortfolioPath } from "@/lib/public-env"
import { cn } from "@/lib/utils"
import type { Portfolio } from "@/types/portfolio"

import { formatPortfolioDate } from "../../utils/deployedPortfolio"

interface PublishLiveCardProps {
  portfolio: Portfolio
  ownerName?: string
  isFeatured?: boolean
  copied?: boolean
  /** When false, the card skips its own hover zoom/lift (e.g. as the top of a deck). */
  enableHover?: boolean
  onClick?: () => void
  onCopyUrl?: () => void
  onUnpublish?: () => void
}

export const PublishLiveCard = ({
  portfolio,
  ownerName,
  isFeatured = false,
  copied = false,
  enableHover = true,
  onClick,
  onCopyUrl,
  onUnpublish,
}: PublishLiveCardProps) => {
  const slug = portfolio.slug?.trim()
  const externalUrl = (portfolio.external_url ?? portfolio.externalUrl ?? "").trim()
  const sourceTypeNormalized = (portfolio.source_type ?? portfolio.sourceType ?? "")
    .trim()
    .toLowerCase()
  const isExternal =
    sourceTypeNormalized === "external" ||
    (sourceTypeNormalized !== "generated" && externalUrl.length > 0)
  const displayUrl = isExternal && externalUrl
    ? externalUrl
    : slug
      ? buildPortfolioPath(slug, ownerName)
      : ""
  const openHref = displayUrl

  const screenshotUrl = portfolio.screenshot_url?.trim() || null
  // Track load/fail by the src they apply to, so a changed screenshot resets
  // state without a setState-in-effect.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageLoaded = loadedSrc === screenshotUrl
  const imageFailed = failedSrc === screenshotUrl

  const showImage = Boolean(screenshotUrl) && !imageFailed

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card transition-all",
        isFeatured
          ? "border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
          : enableHover
            ? "border-border hover:border-primary/30 hover:shadow-lg hover:shadow-black/20"
            : "border-border",
        onClick && "hover:cursor-pointer",
      )}
      onClick={onClick}
    >
      {/* Screenshot */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {showImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-accent/20" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshotUrl ?? undefined}
              alt={`${portfolio.title} preview`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoadedSrc(screenshotUrl)}
              onError={() => setFailedSrc(screenshotUrl)}
              className={cn(
                "h-full w-full object-cover object-top transition-all duration-500",
                enableHover && "group-hover:scale-[1.02]",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card">
            <FiImage className="h-7 w-7 text-muted-foreground/50" />
          </div>
        )}

        {/* Top gradient for badge legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/45 to-transparent" />

        {/* Live badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>

        {/* Featured badge */}
        {isFeatured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200 backdrop-blur-sm">
            <FiStar className="h-3 w-3" />
            Featured
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
          {portfolio.title}
        </h3>
        {displayUrl ? (
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
            {displayUrl}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">Not yet published</p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">
          Updated {formatPortfolioDate(portfolio.updated_at)}
        </p>

        {/* Actions */}
        <div
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onCopyUrl}
            disabled={!slug}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? (
              <FiCheck className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <FiCopy className="h-3.5 w-3.5" />
            )}
            Copy URL
          </button>
          {openHref && (
            <a
              href={openHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          )}
          <button
            type="button"
            onClick={onUnpublish}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-500/35 hover:text-red-400"
          >
            <FiEyeOff className="h-3.5 w-3.5" />
            Unpublish
          </button>
        </div>
      </div>
    </article>
  )
}
