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

const TIER_SEGMENTS = [
  { label: "Unverified", range: "0-20", color: "bg-zinc-500", width: "20%" },
  { label: "Basic", range: "21-40", color: "bg-blue-400", width: "20%" },
  { label: "Intermediate", range: "41-60", color: "bg-yellow-500", width: "20%" },
  { label: "Advanced", range: "61-80", color: "bg-amber-500", width: "20%" },
  { label: "Expert", range: "81-100", color: "bg-amber-400", width: "20%" },
] as const

const SCORING_RULES = [
  {
    title: "Canonical Coverage",
    description:
      "Coverage measures how many skill claims resolve to canonical skills.",
  },
  {
    title: "Source Weighting",
    description:
      "Source quality uses deterministic trust weights: resume 0.8, manual 0.5, imported 0.9.",
  },
  {
    title: "Weighted Blend",
    description:
      "Initial score = 100 × (0.7 × coverage + 0.3 × sourceQuality).",
  },
  {
    title: "Parser Confidence (Optional)",
    description:
      "When available, parser confidence is blended as a 10% nudge to the base score.",
  },
] as const

const ScoringTransparency = () => {
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

          <p className="text-[10px] text-muted-foreground border-t border-border pt-3">
            Baseline uses deterministic skill-only scoring. Evidence-backed scoring
            will be layered in a later phase.
          </p>
        </CardContent>
      )}
    </Card>
  )
}

export default ScoringTransparency
