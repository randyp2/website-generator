"use client"

import { RefreshCw, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { VerificationOverviewProps } from "./verification.types"
import VerificationScoreRing from "./VerificationScoreRing"

const KPI_ITEMS = [
  {
    key: "totalSkills",
    label: "Total Skills",
    context: "Tracked",
    accent: "bg-sky-500/70",
    rail: "from-sky-500/70 via-cyan-400/50 to-transparent",
    value: "text-sky-700 dark:text-sky-200",
  },
  {
    key: "matchedSkills",
    label: "Matched",
    context: "Resume aligned",
    accent: "bg-emerald-500/75",
    rail: "from-emerald-500/70 via-teal-400/50 to-transparent",
    value: "text-emerald-700 dark:text-emerald-200",
  },
  {
    key: "unmatchedSkills",
    label: "Unmatched",
    context: "Needs evidence",
    accent: "bg-amber-500/75",
    rail: "from-amber-500/70 via-yellow-400/50 to-transparent",
    value: "text-amber-700 dark:text-amber-200",
  },
  {
    key: "unverifiedClaimsCount",
    label: "Unverified",
    context: "Awaiting proof",
    accent: "bg-zinc-500/70",
    rail: "from-zinc-500/70 via-slate-400/50 to-transparent",
    value: "text-zinc-700 dark:text-zinc-200",
  },
] as const

const VerificationOverview = ({
  data,
  lastRerunAt,
  onRerunChecks,
  isRerunningChecks = false,
  showActions = true,
}: VerificationOverviewProps) => {
  const lastRerunLabel = lastRerunAt
    ? new Date(lastRerunAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Never"

  return (
    <Card className="relative overflow-hidden border border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-orange-300/12 via-orange-200/6 to-transparent dark:from-orange-300/14 dark:via-orange-200/6"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 right-0 h-24 w-24 rounded-full bg-orange-300/12 blur-3xl dark:bg-orange-200/12"
      />
      <CardContent className="relative z-10 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          {/* Verification Ring */}
          <VerificationScoreRing score={data.overallScore} tier={data.tier} />

          {/* KPI Cards */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {KPI_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-border/70 bg-background/75 p-3.5 shadow-sm transition-colors hover:border-border hover:bg-background/90 dark:bg-white/[0.035] dark:hover:bg-white/[0.055]",
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-px bg-gradient-to-r",
                      item.rail,
                    )}
                  />
                  <div
                    aria-hidden
                    className={cn("absolute right-0 top-0 h-9 w-9", item.accent)}
                    style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("text-2xl font-semibold tracking-normal", item.value)}>
                        {data[item.key]}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-foreground">
                        {item.label}
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {item.context}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p>{data.trustNote}</p>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
              <Badge variant="outline">
                Evidence Baseline {data.baselineOverallScore}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  data.evidenceDelta > 0 && "text-emerald-600 border-emerald-600/40",
                  data.evidenceDelta < 0 && "text-red-500 border-red-500/40",
                )}
              >
                Evidence Points {data.evidenceDelta > 0 ? "+" : ""}{data.evidenceDelta}
              </Badge>
              <Badge variant="outline">
                Your Score {data.overallScore}
              </Badge>
            </div>

            {showActions ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void onRerunChecks()
                  }}
                  disabled={isRerunningChecks}
                  className="gap-1.5 hover:cursor-pointer"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isRerunningChecks && "animate-spin")} />
                  {isRerunningChecks ? "Re-running..." : "Re-run Checks"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Last re-run {lastRerunLabel}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Last re-run {lastRerunLabel}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VerificationOverview
