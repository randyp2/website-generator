"use client"

import { useEffect, useMemo, useState } from "react"

import type {
  FilterOption,
  ConnectionProvider,
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
import ConnectionsPanel from "./ConnectionsPanel"
import SkillLeaderboard from "./SkillLeaderboard"
import SkillCharts from "./SkillCharts"
import SkillDetailDrawer from "./SkillDetailDrawer"
import ScoringTransparency from "./ScoringTransparency"
import ResumeVerificationGuard from "./ResumeVerificationGuard"
import useVerificationSubTab from "./useVerificationSubTab"
import useConnections from "./useConnections"

const VerificationTab = ({ userId }: VerificationTabProps) => {
  void userId

  const [activeFilter, setActiveFilter] = useState<FilterOption>("all")
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isDeletingClaim, setIsDeletingClaim] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { summary, isLoading, error, refetch } = useVerificationSummary()
  const {
    connections,
    error: connectionsError,
    refetch: refetchConnections,
  } = useConnections()
  const { activeTab } = useVerificationSubTab()

  useEffect(() => {
    if (activeTab === "skill-verification") {
      refetch()
      refetchConnections()
    }
  }, [activeTab, refetch, refetchConnections])

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
    setDeleteError(null)
    setSelectedSkillId(skillId)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedSkillId(null)
    setDeleteError(null)
  }

  const handleRerunChecks = () => {
    refetch()
  }

  const handleConnectAccount = (provider: ConnectionProvider) => {
    console.info(
      `[connections] connect requested for "${provider}" (connect flow not implemented yet)`,
    )
  }

  const handleDisconnectAccount = (provider: ConnectionProvider) => {
    console.info(
      `[connections] disconnect requested for "${provider}" (disconnect flow not implemented yet)`,
    )
  }

  const handleDeleteClaim = async (claimId: string) => {
    setIsDeletingClaim(true)
    setDeleteError(null)

    try {
      const res = await fetch(
        `/api/profile/resume-verification/claims/${claimId}`,
        { method: "DELETE" },
      )

      if (!res.ok) {
        let message = "Failed to delete claim"
        try {
          const body = await res.json()
          if (typeof body?.error === "string") {
            message = body.error
          }
        } catch {
          // Fallback to default message
        }
        throw new Error(message)
      }

      handleDrawerClose()
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete claim",
      )
    } finally {
      setIsDeletingClaim(false)
    }
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
        <VerificationEmptyState onStart={refetch} />
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
        connections={connections}
        onConnect={handleConnectAccount}
        onDisconnect={handleDisconnectAccount}
      />
      {connectionsError && (
        <p className="text-xs text-muted-foreground">
          Could not refresh connection state. Showing cached/default values.
        </p>
      )}

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
        isDeletingClaim={isDeletingClaim}
        deleteError={deleteError}
        onDeleteClaim={handleDeleteClaim}
        onClose={handleDrawerClose}
      />
    </ResumeVerificationGuard>
  )
}

export default VerificationTab
