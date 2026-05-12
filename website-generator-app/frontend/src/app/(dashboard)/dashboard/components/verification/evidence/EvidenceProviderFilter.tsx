"use client"

import { cn } from "@/lib/utils"
import type { EvidenceProviderCategory, EvidenceProviderFilterProps } from "./evidence-tab.types"

const FILTER_OPTIONS: { value: EvidenceProviderCategory; label: string }[] = [
  { value: "all",           label: "All"            },
  { value: "auth_provider", label: "Auth Providers" },
  { value: "upload",        label: "Uploads"        },
]

const EvidenceProviderFilter = ({
  active,
  counts,
  onChange,
}: EvidenceProviderFilterProps) => (
  <div className="border-b border-border py-3 -mx-1 px-1">
    <div className="flex gap-2 flex-wrap">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = active === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {opt.label}
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background/50 text-muted-foreground",
              )}
            >
              {counts[opt.value]}
            </span>
          </button>
        )
      })}
    </div>
  </div>
)

export default EvidenceProviderFilter
