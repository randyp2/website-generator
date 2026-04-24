"use client"

import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { VerificationTier } from "./verification.types"
import { getTierBgColor, getTierColor, getTierRingColor } from "./verification.utils"

const RING_RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

type ScoreLabelMode = "stacked" | "inline"

interface VerificationScoreRingProps {
  score: number
  tier: VerificationTier
  sizeClassName?: string
  showTierBadge?: boolean
  scoreLabelMode?: ScoreLabelMode
  animate?: boolean
  className?: string
}

const VerificationScoreRing = ({
  score,
  tier,
  sizeClassName = "h-28 w-28",
  showTierBadge = true,
  scoreLabelMode = "stacked",
  animate = true,
  className,
}: VerificationScoreRingProps) => {
  const clampedScore = Math.max(0, Math.min(100, score))
  const offset = CIRCUMFERENCE - (clampedScore / 100) * CIRCUMFERENCE

  return (
    <div className={cn("flex flex-col items-center gap-2 shrink-0", className)}>
      <svg
        aria-label={`Overall verification score ${clampedScore} out of 100`}
        viewBox="0 0 120 120"
        className={sizeClassName}
      >
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          className={getTierRingColor(tier)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={
            animate
              ? { strokeDashoffset: CIRCUMFERENCE }
              : { strokeDashoffset: offset }
          }
          animate={{ strokeDashoffset: offset }}
          transition={
            animate
              ? { duration: 1, ease: "easeOut" }
              : { duration: 0 }
          }
          transform="rotate(-90 60 60)"
        />
        {scoreLabelMode === "stacked" ? (
          <>
            <text
              x="60"
              y="56"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-2xl font-bold"
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              {clampedScore}
            </text>
            <text
              x="60"
              y="74"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground"
              style={{ fontSize: "10px" }}
            >
              /100
            </text>
          </>
        ) : (
          <text
            x="60"
            y="61"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-[1.4rem] font-semibold tracking-tight"
            style={{ fontSize: "22px", fontWeight: 600 }}
          >
            {`${clampedScore}/100`}
          </text>
        )}
      </svg>

      {showTierBadge ? (
        <Badge
          className={cn(
            "text-xs font-semibold",
            getTierBgColor(tier),
            getTierColor(tier),
          )}
        >
          {tier}
        </Badge>
      ) : null}
    </div>
  )
}

export default VerificationScoreRing
