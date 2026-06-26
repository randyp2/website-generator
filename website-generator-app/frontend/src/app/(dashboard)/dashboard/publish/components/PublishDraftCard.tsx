"use client"

import { FiArrowRight, FiFileText } from "react-icons/fi"

import type { Portfolio } from "@/types/portfolio"

import { formatPortfolioDate } from "../../utils/deployedPortfolio"

interface PublishDraftCardProps {
  portfolio: Portfolio
  onClick?: () => void
}

export const PublishDraftCard = ({
  portfolio,
  onClick,
}: PublishDraftCardProps) => (
  <article
    role={onClick ? "button" : undefined}
    onClick={onClick}
    className="group flex items-center gap-3 rounded-xl border border-border bg-card/50 px-3.5 py-3 transition-all hover:cursor-pointer hover:border-primary/40 hover:bg-card"
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-foreground">
      <FiFileText className="h-4 w-4" />
    </span>
    <div className="min-w-0 flex-1">
      <h3 className="line-clamp-1 text-sm font-medium text-foreground">
        {portfolio.title}
      </h3>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        Draft · edited {formatPortfolioDate(portfolio.updated_at)}
      </p>
    </div>
    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-orange-400">
      Publish
      <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </span>
  </article>
)
