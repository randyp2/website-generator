"use client"

import { motion } from "framer-motion"
import { AlertCircle, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { SkillLeaderboardProps } from "./verification.types"
import {
  getTierColor,
  getTierBgColor,
  getTierBarColor,
  getFreshnessLabel,
} from "./verification.utils"

const SkillLeaderboard = ({
  skills,
  onSkillClick,
}: SkillLeaderboardProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Skill Verification Leaderboard
        </h3>
        <p className="text-xs text-muted-foreground">
          {skills.length} skills
        </p>
      </div>

      <div className="space-y-2">
        {skills.map((skill, index) => {
          const freshness = getFreshnessLabel(skill.freshness)

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              onClick={() => onSkillClick(skill.id)}
              className="flex items-center gap-3 group cursor-pointer rounded-lg p-2 hover:bg-muted/50 transition-colors"
            >
              {/* Rank */}
              <span className="w-5 text-right text-xs text-muted-foreground font-mono">
                {index + 1}
              </span>

              {/* Skill Name */}
              <div className="w-28 min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {skill.name}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {skill.evidenceCount} linked evidence
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                <motion.div
                  className={cn("h-full rounded-md", getTierBarColor(skill.tier))}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{
                    delay: index * 0.04 + 0.1,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-foreground">
                  {skill.score}
                </span>
              </div>

              {/* Tier Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "w-24 justify-center text-[10px] border-0",
                  getTierBgColor(skill.tier),
                  getTierColor(skill.tier),
                )}
              >
                {skill.tier}
              </Badge>

              {/* Freshness */}
              <span
                className={cn(
                  "w-10 text-[10px] text-center",
                  freshness.color,
                )}
              >
                {freshness.label}
              </span>

              {/* Conflict Icon */}
              <div className="w-5 flex justify-center">
                {skill.status === "conflict" && (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
              </div>

              {/* Chevron */}
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default SkillLeaderboard
