"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { SkillChartsProps } from "./verification.types"
import {
  getEvidenceMixForSkill,
  calculateGapToNextTier,
  getFreshnessLabel,
  getTierColor,
  getTierBarColor,
  EVIDENCE_TYPE_COLORS,
  EVIDENCE_TYPE_LABELS,
} from "./verification.utils"

const SkillCharts = ({ skills }: SkillChartsProps) => {
  const topSkills = skills.slice(0, 6)
  const freshnessGroups = {
    fresh: skills.filter((s) => s.freshness === "fresh").length,
    aging: skills.filter((s) => s.freshness === "aging").length,
    stale: skills.filter((s) => s.freshness === "stale").length,
  }
  const totalSkills = skills.length
  const statusGroups = {
    verified: skills.filter((s) => s.status === "verified").length,
    needs_action: skills.filter((s) => s.status === "needs_action").length,
    conflict: skills.filter((s) => s.status === "conflict").length,
    pending: skills.filter((s) => s.status === "pending").length,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Evidence Mix by Skill */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Evidence Mix by Skill</CardTitle>
          <CardDescription className="text-xs">
            Breakdown of evidence types per skill
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topSkills.map((skill) => {
            const mix = getEvidenceMixForSkill(skill)
            return (
              <div key={skill.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate w-24">
                    {skill.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {skill.evidenceCount} items
                  </span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                  {mix
                    .filter((s) => s.percentage > 0)
                    .map((segment) => (
                      <div
                        key={segment.type}
                        className={cn(
                          "h-full transition-all",
                          EVIDENCE_TYPE_COLORS[segment.type],
                        )}
                        style={{ width: `${segment.percentage}%` }}
                        title={`${EVIDENCE_TYPE_LABELS[segment.type]}: ${segment.count}`}
                      />
                    ))}
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            {(Object.keys(EVIDENCE_TYPE_COLORS) as Array<keyof typeof EVIDENCE_TYPE_COLORS>).map(
              (type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div
                    className={cn("h-2 w-2 rounded-full", EVIDENCE_TYPE_COLORS[type])}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {EVIDENCE_TYPE_LABELS[type]}
                  </span>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gap to Next Tier */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Gap to Next Tier</CardTitle>
          <CardDescription className="text-xs">
            Points needed to reach the next level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {skills
            .filter((s) => s.tier !== "Expert")
            .slice(0, 6)
            .map((skill) => {
              const gap = calculateGapToNextTier(skill.score, skill.tier)
              if (!gap) return null
              return (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate w-24">
                      {skill.name}
                    </span>
                    <span className={cn("text-[10px]", getTierColor(gap.nextTier))}>
                      {gap.gap} pts to {gap.nextTier}
                    </span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", getTierBarColor(skill.tier))}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>

      {/* Freshness Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Freshness Overview</CardTitle>
          <CardDescription className="text-xs">
            How current your skill evidence is
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-6 w-full overflow-hidden rounded-full bg-muted mb-4">
            {totalSkills > 0 && (
              <>
                {freshnessGroups.fresh > 0 && (
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${(freshnessGroups.fresh / totalSkills) * 100}%`,
                    }}
                  />
                )}
                {freshnessGroups.aging > 0 && (
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${(freshnessGroups.aging / totalSkills) * 100}%`,
                    }}
                  />
                )}
                {freshnessGroups.stale > 0 && (
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(freshnessGroups.stale / totalSkills) * 100}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(["fresh", "aging", "stale"] as const).map((key) => {
              const info = getFreshnessLabel(key)
              return (
                <div key={key} className="text-center">
                  <p className={cn("text-xl font-bold", info.color)}>
                    {freshnessGroups[key]}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {info.label}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status Distribution</CardTitle>
          <CardDescription className="text-xs">
            Skills breakdown by verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-6 w-full overflow-hidden rounded-full bg-muted mb-4">
            {totalSkills > 0 && (
              <>
                {statusGroups.verified > 0 && (
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${(statusGroups.verified / totalSkills) * 100}%`,
                    }}
                  />
                )}
                {statusGroups.needs_action > 0 && (
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${(statusGroups.needs_action / totalSkills) * 100}%`,
                    }}
                  />
                )}
                {statusGroups.conflict > 0 && (
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(statusGroups.conflict / totalSkills) * 100}%`,
                    }}
                  />
                )}
                {statusGroups.pending > 0 && (
                  <div
                    className="h-full bg-zinc-500"
                    style={{
                      width: `${(statusGroups.pending / totalSkills) * 100}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Verified", count: statusGroups.verified, color: "text-emerald-400" },
              { label: "Needs Action", count: statusGroups.needs_action, color: "text-yellow-400" },
              { label: "Conflicts", count: statusGroups.conflict, color: "text-red-400" },
              { label: "Pending", count: statusGroups.pending, color: "text-zinc-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <p className={cn("text-lg font-bold", item.color)}>
                  {item.count}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SkillCharts
