"use client"

import { useMemo, useState } from "react"

import type {
  FilterOption,
  VerificationTabProps,
} from "./verification.types"
import {
  deriveOverviewFromSummary,
  filterSkills,
  mapSummaryClaimsToSkillVerifications,
} from "./verification.utils"
import useVerificationSummary from "./useVerificationSummary"

import {
  VerificationEmptyState,
  VerificationErrorState,
  VerificationLoadingSkeleton,
} from "./VerificationEmptyState"
import VerificationFilterBar from "./VerificationFilterBar"
import VerificationOverview from "./VerificationOverview"
import SkillLeaderboard from "./SkillLeaderboard"
import SkillCharts from "./SkillCharts"
import SkillDetailDrawer from "./SkillDetailDrawer"
import ScoringTransparency from "./ScoringTransparency"
import ResumeVerificationGuard from "./ResumeVerificationGuard"

const VerificationTab = ({ userId }: VerificationTabProps) => {
  void userId

  const [activeFilter, setActiveFilter] = useState<FilterOption>("all")
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { summary, isLoading, error, refetch } = useVerificationSummary()

  const skills = useMemo(
    () =>
      summary
        ? mapSummaryClaimsToSkillVerifications(
            summary.claims,
            summary.suggestedActions,
            summary.generatedAt,
          )
        : [],
    [summary],
  )

  const overview = useMemo(
    () => (summary ? deriveOverviewFromSummary(summary) : null),
    [summary],
  )

  const filteredSkills = useMemo(
    () => filterSkills(skills, activeFilter),
    [skills, activeFilter],
  )

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) ?? null,
    [skills, selectedSkillId],
  )

  const filterCounts = useMemo<Record<FilterOption, number>>(
    () => ({
      all: skills.length,
      verified: skills.filter((s) => s.status === "verified").length,
      needs_action: skills.filter((s) => s.status === "needs_action").length,
      conflicts: skills.filter((s) => s.status === "conflict").length,
    }),
    [skills],
  )

  const handleSkillClick = (skillId: string) => {
    setSelectedSkillId(skillId)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedSkillId(null)
  }

  const handleRerunChecks = () => {
    refetch()
  }

  if (isLoading) {
    return <VerificationLoadingSkeleton />
  }

  if (error) {
    return <VerificationErrorState onRetry={() => window.location.reload()} />
  }

  if (!summary || summary.totalSkills === 0 || !overview) {
    return (
      <ResumeVerificationGuard>
        <VerificationEmptyState onStart={() => {}} />
      </ResumeVerificationGuard>
    )
  }

  return (
    <ResumeVerificationGuard>
      <VerificationFilterBar
        active={activeFilter}
        counts={filterCounts}
        onChange={setActiveFilter}
      />

      <VerificationOverview
        data={overview}
        onRerunChecks={handleRerunChecks}
      />

      <SkillLeaderboard
        skills={filteredSkills}
        onSkillClick={handleSkillClick}
      />

      <SkillCharts skills={filteredSkills} />

      <ScoringTransparency />

      <SkillDetailDrawer
        skill={selectedSkill}
        evidence={[]}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </ResumeVerificationGuard>
  )
}

export default VerificationTab
