"use client"

import { cn } from "@/lib/utils"
import type { EvidenceSourceSidebarProps } from "./evidence-tab.types"

const EvidenceSourceSidebar = ({
  filters,
  active,
  onChange,
}: EvidenceSourceSidebarProps) => (
  <nav className="w-44 shrink-0">
    <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      Sources
    </p>
    <ul className="space-y-0.5">
      {filters.map((filter) => {
        const isActive = active === filter.value
        return (
          <li key={filter.value}>
            <button
              onClick={() => onChange(filter.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:cursor-pointer",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span>{filter.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {filter.count}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  </nav>
)

export default EvidenceSourceSidebar
