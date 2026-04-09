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
    title: "Evidence Weighting",
    description:
      "Third-party verified evidence (certifications, endorsements) carries more weight than self-reported claims.",
  },
  {
    title: "Freshness Decay",
    description:
      "Evidence older than 12 months begins to decay. Stale evidence (24+ months) significantly reduces scores.",
  },
  {
    title: "Conflict Penalties",
    description:
      "Discrepancies between claimed experience and actual evidence incur score deductions until resolved.",
  },
  {
    title: "Consistency Bonus",
    description:
      "Skills supported by multiple independent sources receive a consistency multiplier.",
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
            Scores are calculated using rule version v2.1. All deductions
            (staleness, conflicts) are shown transparently in skill details.
          </p>
        </CardContent>
      )}
    </Card>
  )
}

export default ScoringTransparency
