"use client"

import { FiFileText, FiInbox } from "react-icons/fi"

import { cn } from "@/lib/utils"

import type { Portfolio } from "@/types/portfolio"

interface StepPickProps {
  drafts: Portfolio[]
  selectedPortfolioId: string | null
  onSelect: (portfolioId: string) => void
}

export const StepPick = ({ drafts, selectedPortfolioId, onSelect }: StepPickProps) => {
  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
        <FiInbox className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No drafts to publish</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Every portfolio is already live. Unpublish one or create a new portfolio to
          continue.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Pick the draft you want to publish.
      </p>
      <div className="grid max-h-[320px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {drafts.map((portfolio) => {
          const isSelected = String(portfolio.id) === selectedPortfolioId
          return (
            <button
              key={String(portfolio.id)}
              type="button"
              onClick={() => onSelect(String(portfolio.id))}
              className={cn(
                "group flex items-start gap-3 rounded-xl border bg-card/70 p-3 text-left transition-all",
                isSelected
                  ? "border-primary/60 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                  : "border-border hover:border-primary/30 hover:bg-card",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  isSelected
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                <FiFileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">
                  {portfolio.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {portfolio.template_id ?? "Custom build"}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
