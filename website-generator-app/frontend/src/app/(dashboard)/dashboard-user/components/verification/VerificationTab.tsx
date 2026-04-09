"use client"

import { useMemo, useState } from "react"

import type {
  ConnectionProvider,
  EvidenceType,
  FilterOption,
  ViewState,
  VerificationTabProps,
} from "./verification.types"
import {
  MOCK_CONNECTIONS,
  MOCK_EVIDENCE,
  MOCK_HISTORY,
  MOCK_OVERVIEW,
  MOCK_SKILLS,
} from "./verification.mock"
import { filterSkills } from "./verification.utils"

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

const VerificationTab = ({ userId }: VerificationTabProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all")
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewState] = useState<ViewState>("loaded")
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState<
    EvidenceType | "all"
  >("all")

  const filteredSkills = useMemo(
    () => filterSkills(MOCK_SKILLS, activeFilter),
    [activeFilter],
  )

  const selectedSkill = useMemo(
    () => MOCK_SKILLS.find((s) => s.id === selectedSkillId) ?? null,
    [selectedSkillId],
  )

  const skillEvidence = useMemo(
    () => MOCK_EVIDENCE.filter((e) => e.skillId === selectedSkillId),
    [selectedSkillId],
  )

  const filterCounts = useMemo<Record<FilterOption, number>>(
    () => ({
      all: MOCK_SKILLS.length,
      verified: MOCK_SKILLS.filter((s) => s.status === "verified").length,
      needs_action: MOCK_SKILLS.filter((s) => s.status === "needs_action")
        .length,
      conflicts: MOCK_SKILLS.filter((s) => s.status === "conflict").length,
    }),
    [],
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

  const handleConnect = (_provider: ConnectionProvider) => {
    // Placeholder for backend wiring
  }

  const handleDisconnect = (_provider: ConnectionProvider) => {
    // Placeholder for backend wiring
  }

  if (viewState === "empty") {
    return <VerificationEmptyState onStart={() => {}} />
  }

  if (viewState === "loading") {
    return <VerificationLoadingSkeleton />
  }

  if (viewState === "error") {
    return <VerificationErrorState onRetry={() => {}} />
  }

  return (
    <div className="space-y-8">
      <VerificationFilterBar
        active={activeFilter}
        counts={filterCounts}
        onChange={setActiveFilter}
      />

      <VerificationOverview
        data={MOCK_OVERVIEW}
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
    </div>
  )
}

export default VerificationTab
