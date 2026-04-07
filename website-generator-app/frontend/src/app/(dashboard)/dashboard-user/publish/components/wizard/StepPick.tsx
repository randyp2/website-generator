"use client"

import { FiExternalLink, FiFileText, FiInbox } from "react-icons/fi"

import { cn } from "@/lib/utils"

import type { Portfolio } from "@/types/portfolio"

export type PublishSource = "generated" | "external"

interface StepPickProps {
  drafts: Portfolio[]
  source: PublishSource
  externalUrl: string
  selectedPortfolioId: string | null
  onExternalUrlChange: (value: string) => void
  onSelect: (portfolioId: string) => void
  onSourceChange: (source: PublishSource) => void
}

export const StepPick = ({
  drafts,
  source,
  externalUrl,
  selectedPortfolioId,
  onExternalUrlChange,
  onSelect,
  onSourceChange,
}: StepPickProps) => {
  const hasDrafts = drafts.length > 0

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">Choose what to publish</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Start from a generated draft or showcase a portfolio website you already
          have.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSourceChange("generated")}
          className={cn(
            "cursor-pointer rounded-xl border bg-card/70 p-4 text-left transition-all",
            source === "generated"
              ? "border-primary/60 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
              : "border-border hover:border-primary/30 hover:bg-card",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                source === "generated"
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              <FiFileText className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Generated draft</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick one of your saved drafts and publish it.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSourceChange("external")}
          className={cn(
            "cursor-pointer rounded-xl border bg-card/70 p-4 text-left transition-all",
            source === "external"
              ? "border-primary/60 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
              : "border-border hover:border-primary/30 hover:bg-card",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                source === "external"
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              <FiExternalLink className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Existing website</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter a live portfolio URL and carry it through the publish flow.
              </p>
            </div>
          </div>
        </button>
      </div>

      {source === "generated" ? (
        hasDrafts ? (
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
                      "group flex cursor-pointer items-start gap-3 rounded-xl border bg-card/70 p-3 text-left transition-all",
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
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/40 px-6 py-12 text-center">
            <FiInbox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No drafts to publish</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Every portfolio is already live. Switch to Existing website or create a
              new draft to continue.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
          <div>
            <label
              htmlFor="publish-external-url"
              className="text-sm font-medium text-foreground"
            >
              Portfolio website URL
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Example: `https://yourname.com`
            </p>
          </div>
          <input
            id="publish-external-url"
            type="url"
            value={externalUrl}
            onChange={(event) => onExternalUrlChange(event.target.value)}
            placeholder="https://yourportfolio.com"
            autoFocus
            className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            This is a frontend-only flow for now. The URL is used in the wizard preview,
            but final publishing still needs backend support.
          </p>
        </div>
      )}
    </div>
  )
}
