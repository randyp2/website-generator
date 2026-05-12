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
  <div className="flex items-center gap-2">
    {FILTER_OPTIONS.map((opt) => {
      const isActive = active === opt.value
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors hover:cursor-pointer",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {opt.label}
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px]",
              isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground",
            )}
          >
            {counts[opt.value]}
          </span>
        </button>
      )
    })}
  </div>
)

export default EvidenceProviderFilter
