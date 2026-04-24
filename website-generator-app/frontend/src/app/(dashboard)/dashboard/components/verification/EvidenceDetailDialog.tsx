"use client"

import {
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Link2,
} from "lucide-react"
import type { ElementType } from "react"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { EvidenceItem, QualityFlag } from "./verification.types"
import { EVIDENCE_TYPE_LABELS, getQualityBadgeVariant } from "./verification.utils"

interface EvidenceDetailDialogProps {
  evidence: EvidenceItem | null
  onOpenChange: (open: boolean) => void
}

const SOURCE_ICONS: Record<string, ElementType> = {
  github: Github,
  linkedin: Linkedin,
  website: Globe,
  other: Link2,
}

const QUALITY_BAND_TEXT: Record<QualityFlag, string> = {
  high: "Confidence >= 0.85",
  medium: "Confidence between 0.60 and 0.84",
  low: "Confidence below 0.60 or unavailable",
  conflicting: "Conflicting evidence signals",
}

const QUALITY_MEANING_TEXT: Record<QualityFlag, string> = {
  high: "Strong direct match signal.",
  medium: "Good but less direct match signal.",
  low: "Weak/indirect match signal or missing confidence.",
  conflicting: "Multiple signals disagree.",
}
const QUALITY_MODAL_GLOW_CLASS: Record<QualityFlag, string> = {
  high: "border-emerald-400/70 shadow-[0_0_0_1px_rgba(16,185,129,0.30),0_0_22px_rgba(16,185,129,0.35)]",
  medium: "border-amber-400/70 shadow-[0_0_0_1px_rgba(251,191,36,0.30),0_0_22px_rgba(251,191,36,0.35)]",
  low: "border-rose-400/70 shadow-[0_0_0_1px_rgba(251,113,133,0.28),0_0_22px_rgba(251,113,133,0.32)]",
  conflicting: "border-destructive/70 shadow-[0_0_0_1px_hsla(var(--destructive),0.30),0_0_22px_hsla(var(--destructive),0.35)]",
}
const QUALITY_TEXT_COLOR_CLASS: Record<QualityFlag, string> = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-rose-600 dark:text-rose-400",
  conflicting: "text-destructive",
}

const QUALITY_EXPLANATIONS: { label: "High" | "Medium" | "Low"; description: string }[] = [
  { label: "High", description: "confidence 0.85+ (usually direct signals)." },
  { label: "Medium", description: "confidence 0.60 to 0.84 (decent but less direct)." },
  { label: "Low", description: "confidence below 0.60 or unavailable." },
]

const MODAL_CONTENT_CLASS = [
  "w-[94vw] max-w-4xl max-h-[78vh] overflow-y-auto p-4 sm:p-5",
  "[&_button]:cursor-pointer",
  "[&>button]:rounded-md [&>button]:border-0",
  "[&>button]:text-muted-foreground [&>button]:opacity-90",
  "[&>button[data-state=open]]:bg-transparent [&>button[data-state=open]]:text-muted-foreground",
  "[&>button:hover]:bg-primary/10 [&>button:hover]:text-primary [&>button:hover]:opacity-100",
  "[&>button:active]:bg-primary/20 [&>button:active]:text-primary",
  "[&>button]:ring-0 [&>button]:ring-offset-0 [&>button]:outline-none",
  "[&>button]:focus:outline-none [&>button]:focus-visible:outline-none",
  "[&>button]:focus:ring-0 [&>button]:focus-visible:ring-0",
].join(" ")
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

const getLinkConfidenceClass = (confidence: number | null): string => {
  if (typeof confidence !== "number") {
    return "text-muted-foreground"
  }
  if (confidence >= 0.85) {
    return "font-semibold text-emerald-600 dark:text-emerald-400"
  }
  if (confidence >= 0.6) {
    return "font-medium text-amber-600 dark:text-amber-400"
  }
  return "font-medium text-rose-600 dark:text-rose-400"
}

const EvidenceDetailDialog = ({ evidence, onOpenChange }: EvidenceDetailDialogProps) => {
  const metadataJson = useMemo(() => {
    if (!evidence?.metadata) {
      return null
    }
    return JSON.stringify(evidence.metadata, null, 2)
  }, [evidence])
  const modalGlowClass = evidence
    ? QUALITY_MODAL_GLOW_CLASS[evidence.quality]
    : "border-primary/40 shadow-[0_0_16px_rgba(59,130,246,0.16)]"

  const SourceIcon =
    evidence
      ? SOURCE_ICONS[normalizeProvider(evidence.source)] ?? Link2
      : Link2
  const sourceLabel = evidence ? formatProviderLabel(evidence.source) : ""

  return (
    <Dialog open={evidence !== null} onOpenChange={onOpenChange}>
      <DialogContent className={`${MODAL_CONTENT_CLASS} ${modalGlowClass}`}>
        <DialogHeader>
          <DialogTitle className="pr-8">
            {evidence?.title ?? evidence?.description ?? "Evidence Detail"}
          </DialogTitle>
          <DialogDescription>
            Evidence detail and match explanation for {evidence?.skillName ?? "selected skill"}.
          </DialogDescription>
        </DialogHeader>

        {evidence && (
          <div className={MODAL_STACK_CLASS}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{EVIDENCE_TYPE_LABELS[evidence.type]}</Badge>
              <Badge variant="outline" className="gap-1.5">
                <SourceIcon className="h-3.5 w-3.5" />
                {sourceLabel}
              </Badge>
              <Badge variant={getQualityBadgeVariant(evidence.quality)}>
                {evidence.quality}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className={SECTION_LABEL_CLASS}>Description</p>
              <p className={SECTION_TEXT_CLASS}>
                {evidence.description || "No description provided."}
              </p>
            </div>

            <div className={PANEL_SURFACE_CLASS}>
              <p className={SECTION_TITLE_CLASS}>Match Detail</p>
              <div className={KV_WRAP_CLASS}>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Linked skill</span>
                  <span className={KV_VALUE_CLASS}>{evidence.skillName}</span>
                </div>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Match type</span>
                  <span className={KV_VALUE_CLASS}>{formatLinkTypeLabel(evidence.linkType)}</span>
                </div>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Link confidence</span>
                  <span className={`${KV_VALUE_CLASS} ${getLinkConfidenceClass(evidence.linkConfidence)}`}>
                    {typeof evidence.linkConfidence === "number"
                      ? evidence.linkConfidence.toFixed(2)
                      : "Not available"}
                  </span>
                </div>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Confidence band</span>
                  <span className={`${KV_VALUE_CLASS} font-medium`}>
                    {QUALITY_BAND_TEXT[evidence.quality]}
                  </span>
                </div>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>External ID</span>
                  <span className={`${KV_VALUE_CLASS} max-w-[60%] break-all`}>
                    {evidence.externalId ?? "Not available"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className={SECTION_LABEL_CLASS}>Match Reason</p>
              <p className={SECTION_TEXT_CLASS}>
                {evidence.linkReason ?? "No explicit match reason provided for this evidence item."}
              </p>
            </div>

            <div className="space-y-1">
              <p className={SECTION_LABEL_CLASS}>Timeline</p>
              <div className="grid gap-x-5 gap-y-1.5 text-sm sm:grid-cols-2">
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Occurred At</span>
                  <span className={KV_VALUE_CLASS}>{formatDateTime(evidence.occurredAt)}</span>
                </div>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Captured At</span>
                  <span className={KV_VALUE_CLASS}>{formatDateTime(evidence.capturedAt)}</span>
                </div>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Created At</span>
                  <span className={KV_VALUE_CLASS}>{formatDateTime(evidence.createdAt)}</span>
                </div>
                <div className={KV_ROW_CLASS}>
                  <span className={KV_KEY_CLASS}>Updated At</span>
                  <span className={KV_VALUE_CLASS}>{formatDateTime(evidence.updatedAt)}</span>
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
                {QUALITY_EXPLANATIONS.map((item) => (
                  <p key={item.label}>
                    <span className="font-semibold">{item.label}:</span> {item.description}
                  </p>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                This evidence is currently{" "}
                <span className={`font-semibold ${QUALITY_TEXT_COLOR_CLASS[evidence.quality]}`}>
                  {evidence.quality}
                </span>:{" "}
                {QUALITY_MEANING_TEXT[evidence.quality]}
              </p>
            </details>

            <div className="flex justify-end">
              {evidence.url ? (
                <Button asChild size="sm" className="gap-1.5">
                  <a href={evidence.url} target="_blank" rel="noopener noreferrer">
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
  )
}

export default EvidenceDetailDialog
