"use client"

import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { EvidenceTableProps, EvidenceType } from "./verification.types"
import {
  getQualityBadgeVariant,
  EVIDENCE_TYPE_LABELS,
} from "./verification.utils"

const FILTER_OPTIONS: { value: EvidenceType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "endorsement", label: "Endorsements" },
  { value: "certification", label: "Certifications" },
  { value: "project", label: "Projects" },
  { value: "assessment", label: "Assessments" },
  { value: "self_reported", label: "Self-reported" },
]

const EvidenceTable = ({
  evidence,
  activeTypeFilter,
  onTypeFilterChange,
}: EvidenceTableProps) => {
  const filtered = useMemo(
    () =>
      activeTypeFilter === "all"
        ? evidence
        : evidence.filter((e) => e.type === activeTypeFilter),
    [evidence, activeTypeFilter],
  )

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Evidence</h3>

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTypeFilterChange(opt.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeTypeFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Skill
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                Source
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                Description
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Quality
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0 even:bg-muted/30"
              >
                <td className="px-3 py-2 text-xs font-medium text-foreground">
                  {item.skillName}
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-[10px]">
                    {EVIDENCE_TYPE_LABELS[item.type]}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">
                  {item.source}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell max-w-48 truncate">
                  {item.description}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant={getQualityBadgeVariant(item.quality)}
                    className="text-[10px]"
                  >
                    {item.quality}
                  </Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-xs text-muted-foreground"
                >
                  No evidence items match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EvidenceTable
