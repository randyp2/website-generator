"use client"

import { motion } from "framer-motion"
import { RefreshCw, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { VerificationOverviewProps } from "./verification.types"
import { getTierColor, getTierBgColor } from "./verification.utils"

const CIRCUMFERENCE = 2 * Math.PI * 52

const KPI_ITEMS = [
  { key: "totalSkills", label: "Total Skills", accent: "" },
  { key: "matchedSkills", label: "Matched", accent: "border-l-2 border-l-emerald-400" },
  { key: "unmatchedSkills", label: "Unmatched", accent: "border-l-2 border-l-yellow-400" },
  { key: "unverifiedClaimsCount", label: "Unverified", accent: "border-l-2 border-l-zinc-400" },
] as const

const VerificationOverview = ({
  data,
  onRerunChecks,
  isRerunningChecks = false,
}: VerificationOverviewProps) => {
  const offset = CIRCUMFERENCE - (data.overallScore / 100) * CIRCUMFERENCE
  const lastCheckedLabel = new Date(data.lastRunDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          {/* Verification Ring */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <svg viewBox="0 0 120 120" className="h-28 w-28">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                className="text-muted"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                className="text-amber-500"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: "easeOut" }}
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="56"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-2xl font-bold"
                style={{ fontSize: "24px", fontWeight: 700 }}
              >
                {data.overallScore}
              </text>
              <text
                x="60"
                y="74"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground"
                style={{ fontSize: "10px" }}
              >
                / 100
              </text>
            </svg>
            <Badge
              className={cn(
                "text-xs font-semibold",
                getTierBgColor(data.tier),
                getTierColor(data.tier),
              )}
            >
              {data.tier}
            </Badge>
          </div>

          {/* KPI Cards */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {KPI_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "rounded-lg bg-muted/50 p-3",
                    item.accent,
                  )}
                >
                  <p className="text-2xl font-bold text-foreground">
                    {data[item.key]}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
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
                Starting Score {data.baselineOverallScore}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  data.evidenceDelta > 0 && "text-emerald-600 border-emerald-600/40",
                  data.evidenceDelta < 0 && "text-red-500 border-red-500/40",
                )}
              >
                Project Boost {data.evidenceDelta > 0 ? "+" : ""}{data.evidenceDelta}
              </Badge>
              <Badge variant="outline">
                Your Score {data.overallScore}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void onRerunChecks()
                }}
                disabled={isRerunningChecks}
                className="gap-1.5"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRerunningChecks && "animate-spin")} />
                {isRerunningChecks ? "Re-running..." : "Re-run Checks"}
              </Button>
              <span className="text-xs text-muted-foreground">
                Last checked {lastCheckedLabel}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VerificationOverview
