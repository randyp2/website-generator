"use client"

import { cn } from "@/lib/utils"

import type { FilterOption, VerificationFilterBarProps } from "./verification.types"

const FILTER_LABELS: Record<FilterOption, string> = {
  all: "All Skills",
  verified: "Verified",
  needs_action: "Needs Action",
  conflicts: "Conflicts",
}

const VerificationFilterBar = ({
  active,
  counts,
  onChange,
}: VerificationFilterBarProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-3 -mx-1 px-1">
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(FILTER_LABELS) as FilterOption[]).map((filter) => (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active === filter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {FILTER_LABELS[filter]}
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
                active === filter
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background/50 text-muted-foreground",
              )}
            >
              {counts[filter]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default VerificationFilterBar
