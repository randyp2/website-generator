"use client"

import {
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Link2,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

const SOURCE_ICONS: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  website: Globe,
  other: Link2,
}

const normalizeProvider = (value: string): string => value.trim().toLowerCase()

const formatProviderLabel = (value: string): string => {
  const normalized = normalizeProvider(value)
  if (normalized === "github") return "GitHub"
  if (normalized === "linkedin") return "LinkedIn"
  if (normalized === "website") return "Website"
  if (normalized === "other") return "Other"
  return value
}

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "Not available"
  }
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const formatLinkTypeLabel = (linkType: string | null): string => {
  if (!linkType) {
    return "Unlinked"
  }
  return linkType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const getQualityRangeText = (quality: "high" | "medium" | "low" | "conflicting"): string => {
  if (quality === "high") return "Confidence >= 0.85"
  if (quality === "medium") return "Confidence between 0.60 and 0.84"
  if (quality === "low") return "Confidence below 0.60 or unavailable"
  return "Conflicting evidence signals"
}

const getQualityMeaningText = (quality: "high" | "medium" | "low" | "conflicting"): string => {
  if (quality === "high") return "Strong direct match signal."
  if (quality === "medium") return "Good but less direct match signal."
  if (quality === "low") return "Weak/indirect match signal or missing confidence."
  return "Multiple signals disagree."
}

const MODAL_CONTENT_CLASS = "w-[94vw] max-w-4xl max-h-[78vh] overflow-y-auto p-4 sm:p-5"
const MODAL_STACK_CLASS = "space-y-3"
const PANEL_BASE_CLASS = "rounded-md border border-border p-2.5"
const PANEL_SURFACE_CLASS = `${PANEL_BASE_CLASS} bg-background`
const PANEL_ACCENT_CLASS = `${PANEL_BASE_CLASS} border-primary/25 bg-primary/5`
const SECTION_LABEL_CLASS = "text-[11px] uppercase tracking-wide text-muted-foreground"
const SECTION_TITLE_CLASS = "mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground"
const SECTION_TEXT_CLASS = "text-sm text-foreground"
const KV_WRAP_CLASS = "space-y-1 text-sm"
const KV_ROW_CLASS = "flex items-start justify-between gap-2"
const KV_KEY_CLASS = "text-muted-foreground"
const KV_VALUE_CLASS = "text-right text-foreground"

const EvidenceTable = ({
  evidence,
  activeTypeFilter,
  onTypeFilterChange,
}: EvidenceTableProps) => {
  const [selectedEvidence, setSelectedEvidence] = useState<
    EvidenceTableProps["evidence"][number] | null
  >(null)

  const filtered = useMemo(
    () =>
      activeTypeFilter === "all"
        ? evidence
        : evidence.filter((e) => e.type === activeTypeFilter),
    [evidence, activeTypeFilter],
  )

  const metadataJson = useMemo(() => {
    if (!selectedEvidence?.metadata) {
      return null
    }
    return JSON.stringify(selectedEvidence.metadata, null, 2)
  }, [selectedEvidence])

  const selectedSourceIcon =
    selectedEvidence
      ? SOURCE_ICONS[normalizeProvider(selectedEvidence.source)] ?? Link2
      : Link2
  const SelectedSourceIcon = selectedSourceIcon
  const selectedSourceLabel = selectedEvidence
    ? formatProviderLabel(selectedEvidence.source)
    : ""

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
                className="border-b border-border last:border-0 even:bg-muted/30 hover:bg-muted/60 hover:cursor-pointer"
                onClick={() => setSelectedEvidence(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setSelectedEvidence(item)
                  }
                }}
                tabIndex={0}
                role="button"
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

      <Dialog
        open={selectedEvidence !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEvidence(null)
          }
        }}
      >
        <DialogContent className={MODAL_CONTENT_CLASS}>
          <DialogHeader>
            <DialogTitle className="pr-8">
              {selectedEvidence?.title ?? selectedEvidence?.description ?? "Evidence Detail"}
            </DialogTitle>
            <DialogDescription>
              Evidence detail and match explanation for {selectedEvidence?.skillName ?? "selected skill"}.
            </DialogDescription>
          </DialogHeader>

          {selectedEvidence && (
            <div className={MODAL_STACK_CLASS}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {EVIDENCE_TYPE_LABELS[selectedEvidence.type]}
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <SelectedSourceIcon className="h-3.5 w-3.5" />
                  {selectedSourceLabel}
                </Badge>
                <Badge variant={getQualityBadgeVariant(selectedEvidence.quality)}>
                  {selectedEvidence.quality}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className={SECTION_LABEL_CLASS}>Description</p>
                <p className={SECTION_TEXT_CLASS}>
                  {selectedEvidence.description || "No description provided."}
                </p>
              </div>

              <div className={PANEL_SURFACE_CLASS}>
                <p className={SECTION_TITLE_CLASS}>Match Detail</p>
                <div className={KV_WRAP_CLASS}>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Linked skill</span>
                    <span className={KV_VALUE_CLASS}>{selectedEvidence.skillName}</span>
                  </div>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Match type</span>
                    <span className={KV_VALUE_CLASS}>
                      {formatLinkTypeLabel(selectedEvidence.linkType)}
                    </span>
                  </div>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Link confidence</span>
                    <span className={KV_VALUE_CLASS}>
                      {typeof selectedEvidence.linkConfidence === "number"
                        ? selectedEvidence.linkConfidence.toFixed(2)
                        : "Not available"}
                    </span>
                  </div>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Confidence band</span>
                    <span className={KV_VALUE_CLASS}>{getQualityRangeText(selectedEvidence.quality)}</span>
                  </div>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>External ID</span>
                    <span className={`${KV_VALUE_CLASS} max-w-[60%] break-all`}>
                      {selectedEvidence.externalId ?? "Not available"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className={SECTION_LABEL_CLASS}>Match Reason</p>
                <p className={SECTION_TEXT_CLASS}>
                  {selectedEvidence.linkReason ?? "No explicit match reason provided for this evidence item."}
                </p>
              </div>

              <div className="space-y-1">
                <p className={SECTION_LABEL_CLASS}>Timeline</p>
                <div className="grid gap-x-5 gap-y-1.5 text-sm sm:grid-cols-2">
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Occurred At</span>
                    <span className={KV_VALUE_CLASS}>{formatDateTime(selectedEvidence.occurredAt)}</span>
                  </div>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Captured At</span>
                    <span className={KV_VALUE_CLASS}>{formatDateTime(selectedEvidence.capturedAt)}</span>
                  </div>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Created At</span>
                    <span className={KV_VALUE_CLASS}>{formatDateTime(selectedEvidence.createdAt)}</span>
                  </div>
                  <div className={KV_ROW_CLASS}>
                    <span className={KV_KEY_CLASS}>Updated At</span>
                    <span className={KV_VALUE_CLASS}>{formatDateTime(selectedEvidence.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {metadataJson && (
                <details className="space-y-2">
                  <summary className="cursor-pointer text-xs font-medium text-foreground">
                    Raw Metadata
                  </summary>
                  <pre className="max-h-56 overflow-auto text-[11px] text-muted-foreground">
                    {metadataJson}
                  </pre>
                </details>
              )}

              <details className={PANEL_ACCENT_CLASS}>
                <summary className="cursor-pointer text-[11px] font-medium uppercase tracking-wide text-primary">
                  Quality Meaning
                </summary>
                <div className="mt-2 space-y-1 text-xs text-foreground">
                  <p>
                    <span className="font-semibold">High:</span> confidence 0.85+ (usually direct signals).
                  </p>
                  <p>
                    <span className="font-semibold">Medium:</span> confidence 0.60 to 0.84 (decent but less direct).
                  </p>
                  <p>
                    <span className="font-semibold">Low:</span> confidence below 0.60 or unavailable.
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  This evidence is currently <span className="font-medium text-foreground">{selectedEvidence.quality}</span>:{" "}
                  {getQualityMeaningText(selectedEvidence.quality)}
                </p>
              </details>

              <div className="flex justify-end">
                {selectedEvidence.url ? (
                  <Button asChild size="sm" className="gap-1.5">
                    <a
                      href={selectedEvidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Source
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    Source URL unavailable
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EvidenceTable
