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
  { label: "Unverified", range: "0-20", color: "bg-zinc-500", width: "20%" },
  { label: "Basic", range: "21-40", color: "bg-blue-400", width: "20%" },
  { label: "Intermediate", range: "41-60", color: "bg-yellow-500", width: "20%" },
  { label: "Advanced", range: "61-80", color: "bg-amber-500", width: "20%" },
  { label: "Expert", range: "81-100", color: "bg-amber-400", width: "20%" },
] as const

const SCORING_RULES = [
  {
    title: "Coverage Snapshot",
    description:
      "Coverage still shows recognized skill breadth, but it is no longer the direct baseline score formula.",
  },
  {
    title: "Source Weighting",
    description:
      "Source quality uses deterministic trust weights: resume 0.8, manual 0.5, imported 0.9.",
  },
  {
    title: "Baseline Claim Prior Blend",
    description:
      "Per claim prior = 0.70 × matchValue + 0.30 × sourceWeight, and baseline overall is the average of all claim priors.",
  },
  {
    title: "Evidence-aware Claim Prior",
    description:
      "matchValue is deterministic: unmatched=0.00, matched without evidence=0.35, matched with evidence=1.00.",
  },
  {
    title: "Expert Reserved for LLM",
    description:
      "Until LLM verification is available, claim scores are capped at 80, so Expert (81-100) is intentionally locked.",
  },
  {
    title: "Parser Confidence (Optional)",
    description:
      "When available, parser confidence is blended as a 10% nudge to the base score.",
  },
  {
    title: "Evidence Blend (Phase 7)",
    description:
      "Per-claim final score = 0.40 × baseline + 0.60 × evidence support. Overall score applies mean claim evidence delta to baseline.",
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
