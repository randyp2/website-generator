"use client"

import { FiEdit3, FiFileText } from "react-icons/fi"

import { cn } from "@/lib/utils"

import { DescriptionMarkdown } from "./DescriptionMarkdown"

interface PublishHeroDescriptionPanelProps {
  title: string
  description: string
}

const EMPTY_MESSAGE =
  "No description has been added for this portfolio yet. Open Publish flow and use the Details step to add one."

export const PublishHeroDescriptionPanel = ({
  title,
  description,
}: PublishHeroDescriptionPanelProps) => {
  const hasDescription = description.trim().length > 0

  return (
    <div className="px-6 pt-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-background/60">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <FiFileText className="h-4 w-4" />
            Description preview
          </div>
          <span className="text-xs text-muted-foreground">
            {hasDescription ? `${description.trim().length} chars` : "Missing"}
          </span>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6 sm:py-6">
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {hasDescription ? (
            <DescriptionMarkdown
              content={description.trim()}
              className="max-h-[280px] overflow-y-auto pr-1"
            />
          ) : (
            <p className={cn("text-sm leading-relaxed italic text-muted-foreground")}>
              {EMPTY_MESSAGE}
            </p>
          )}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            <FiEdit3 className="h-3.5 w-3.5" />
            Explore card summary source
          </div>
        </div>
      </div>
    </div>
  )
}
