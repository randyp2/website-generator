"use client"

import {
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiEyeOff,
  FiFileText,
  FiStar,
} from "react-icons/fi"

import { cn } from "@/lib/utils"
import type { Portfolio } from "@/types/portfolio"

import { formatPortfolioDate } from "../../utils/deployedPortfolio"

interface PublishListCardProps {
  portfolio: Portfolio
  variant: "draft" | "live"
  isFeatured?: boolean
  copied?: boolean
  onClick?: () => void
  onCopyUrl?: () => void
  onUnpublish?: () => void
}

export const PublishListCard = ({
  portfolio,
  variant,
  isFeatured = false,
  copied = false,
  onClick,
  onCopyUrl,
  onUnpublish,
}: PublishListCardProps) => {
  const isLive = variant === "live"
  const isClickable = isLive && Boolean(onClick)
  const slug = portfolio.slug?.trim()
  const externalUrl = (portfolio.external_url ?? portfolio.externalUrl ?? "").trim()
  const sourceTypeNormalized = (portfolio.source_type ?? portfolio.sourceType ?? "")
    .trim()
    .toLowerCase()
  const isExternal =
    sourceTypeNormalized === "external" ||
    (sourceTypeNormalized !== "generated" && externalUrl.length > 0)
  const displayUrl = isExternal && externalUrl ? externalUrl : slug ? `/portfolio/${slug}` : ""
  const openHref = isExternal && externalUrl ? externalUrl : slug ? `/portfolio/${slug}` : ""

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card/70 p-4 transition-all",
        isFeatured
          ? "border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
          : "border-border hover:border-primary/30",
        isClickable && "cursor-pointer",
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
              {portfolio.title}
            </h3>
            {isLive ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <FiFileText className="h-3 w-3" />
                Draft
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
                <FiStar className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>
          {displayUrl ? (
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {displayUrl}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Not yet published
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Updated {formatPortfolioDate(portfolio.updated_at)}
          </p>
        </div>
      </div>

      {isLive && (
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
      )}
    </article>
  )
}
