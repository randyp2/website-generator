"use client"

import { useMemo, useState } from "react"

import type {
  ConnectionProvider,
  EvidenceType,
  FilterOption,
  VerificationTabProps,
} from "./verification.types"
import {
  MOCK_CONNECTIONS,
  MOCK_EVIDENCE,
  MOCK_HISTORY,
} from "./verification.mock"
import {
  deriveOverview,
  filterSkills,
  mapClaimsToSkillVerifications,
} from "./verification.utils"
import useClaims from "./useClaims"

import {
  VerificationEmptyState,
  VerificationErrorState,
  VerificationLoadingSkeleton,
} from "./VerificationEmptyState"
import VerificationFilterBar from "./VerificationFilterBar"
import VerificationOverview from "./VerificationOverview"
import ConnectionsPanel from "./ConnectionsPanel"
import SkillLeaderboard from "./SkillLeaderboard"
import SkillCharts from "./SkillCharts"
import SkillDetailDrawer from "./SkillDetailDrawer"
import EvidenceTable from "./EvidenceTable"
import VerificationHistory from "./VerificationHistory"
import ScoringTransparency from "./ScoringTransparency"
import ResumeVerificationGuard from "./ResumeVerificationGuard"

const VerificationTab = ({ userId }: VerificationTabProps) => {
  void userId

  const [activeFilter, setActiveFilter] = useState<FilterOption>("all")
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState<
    EvidenceType | "all"
  >("all")

  const { claims, isLoading, error } = useClaims()

  const skills = useMemo(
    () => mapClaimsToSkillVerifications(claims),
    [claims],
  )

  const overview = useMemo(() => deriveOverview(skills), [skills])

  const filteredSkills = useMemo(
    () => filterSkills(skills, activeFilter),
    [skills, activeFilter],
  )

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) ?? null,
    [skills, selectedSkillId],
  )

  const skillEvidence = useMemo(
    () => MOCK_EVIDENCE.filter((e) => e.skillId === selectedSkillId),
    [selectedSkillId],
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
    // Placeholder for backend wiring
  }

  const handleConnect = (provider: ConnectionProvider) => {
    void provider
    // Placeholder for backend wiring
  }

  const handleDisconnect = (provider: ConnectionProvider) => {
    void provider
    // Placeholder for backend wiring
  }

  if (isLoading) {
    return <VerificationLoadingSkeleton />
  }

  if (error) {
    return <VerificationErrorState onRetry={() => window.location.reload()} />
  }

  if (claims.length === 0) {
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

      <ConnectionsPanel
        connections={MOCK_CONNECTIONS}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <SkillLeaderboard
        skills={filteredSkills}
        onSkillClick={handleSkillClick}
      />

      <SkillCharts skills={filteredSkills} />

      <EvidenceTable
        evidence={MOCK_EVIDENCE}
        activeTypeFilter={evidenceTypeFilter}
        onTypeFilterChange={setEvidenceTypeFilter}
      />

      <VerificationHistory entries={MOCK_HISTORY} />

      <ScoringTransparency />

      <SkillDetailDrawer
        skill={selectedSkill}
        evidence={skillEvidence}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </ResumeVerificationGuard>
  )
}

export default VerificationTab
