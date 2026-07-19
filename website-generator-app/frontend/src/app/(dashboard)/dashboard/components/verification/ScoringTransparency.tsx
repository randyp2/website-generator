"use client"

import { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { VerificationSummaryDTO } from "@/types/verification-summary"

const TIER_SEGMENTS = [
  { label: "Incomplete", range: "0-49", color: "bg-zinc-500", width: "50%" },
  { label: "Recognized", range: "50-59", color: "bg-amber-400", width: "10%" },
  { label: "Corroborated", range: "60-74", color: "bg-orange-400", width: "15%" },
  { label: "Strong", range: "75-84", color: "bg-orange-600", width: "10%" },
  { label: "Reviewed", range: "85-100", color: "bg-rose-500", width: "15%" },
] as const

const SCORING_RULES = [
  {
    title: "Neutral Recognition Baseline",
    description:
      "Every active, recognized claim starts at 50. Unresolved claims have no baseline and rejected claims are excluded.",
  },
  {
    title: "Source Is Provenance",
    description:
      "Manual, resume, and imported sources remain visible, but they do not change verification progress.",
  },
  {
    title: "Reviewed Range",
    description:
      "Connector-only claims are capped at 80. Reviewed evidence gradually unlocks the cap from 80 at 85% evidence depth to 100 at 95% evidence depth.",
  },
  {
    title: "Match Versus Depth",
    description:
      "Match confidence controls whether an upload links to a claim. Evidence depth controls scoring strength and reviewed cap progression.",
  },
  {
    title: "Parser Confidence Is Diagnostic",
    description:
      "Parser confidence is retained for extraction diagnostics but has no effect on verification progress.",
  },
  {
    title: "Evidence Progress",
    description:
      "Evidence nudges matched claims from baseline toward the pre-LLM cap using strength, recency, and link frequency with diminishing returns. Overall score applies mean claim evidence delta to baseline.",
  },
] as const

interface ScoringTransparencyProps {
  summary: VerificationSummaryDTO | null
}

const ScoringTransparency = ({ summary }: ScoringTransparencyProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">How Scoring Works</CardTitle>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Tier Threshold Diagram */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">
              Tier Thresholds
            </p>
            <div className="flex h-5 w-full overflow-hidden rounded-full">
              {TIER_SEGMENTS.map((seg) => (
                <div
                  key={seg.label}
                  className={cn("h-full", seg.color)}
                  style={{ width: seg.width }}
                />
              ))}
            </div>
            <div className="flex w-full">
              {TIER_SEGMENTS.map((seg) => (
                <div
                  key={seg.label}
                  className="text-center"
                  style={{ width: seg.width }}
                >
                  <p className="text-[9px] font-medium text-foreground">
                    {seg.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {seg.range}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Rules */}
          <div className="space-y-3">
            {SCORING_RULES.map((rule) => (
              <div key={rule.title}>
                <p className="text-xs font-medium text-foreground">
                  {rule.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-muted-foreground border-t border-border pt-3 space-y-1">
            <p>
              Deterministic scoring is evidence-aware.
            </p>
            {summary && (
              <p>
                Snapshot: baseline {summary.baselineOverallScore}, evidence delta {summary.evidenceDelta > 0 ? "+" : ""}{summary.evidenceDelta}, final {summary.overallScore} ({summary.scoreType}).
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default ScoringTransparency
