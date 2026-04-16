"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

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
import ConnectionsPanel from "./ConnectionsPanel"
import SkillLeaderboard from "./SkillLeaderboard"
import SkillCharts from "./SkillCharts"
import SkillDetailDrawer from "./SkillDetailDrawer"
import ScoringTransparency from "./ScoringTransparency"
import ResumeVerificationGuard from "./ResumeVerificationGuard"
import useVerificationSubTab from "./useVerificationSubTab"
import useConnections from "./useConnections"
import useConnectionActions from "./useConnectionActions"
import useClaimDeletion from "./useClaimDeletion"
import { runConnectionSyncRequest } from "./verification.api"

const VerificationTab = ({ userId }: VerificationTabProps) => {
  void userId

  const [activeFilter, setActiveFilter] = useState<FilterOption>("all")
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isRerunningChecks, setIsRerunningChecks] = useState(false)
  const [rerunChecksError, setRerunChecksError] = useState<string | null>(null)

  const { summary, isLoading, error, refetch } = useVerificationSummary()
  const {
    connections,
    error: connectionsError,
    refetch: refetchConnections,
  } = useConnections()
  const {
    connectionActionInFlight,
    connectionActionError,
    connectProvider,
    disconnectProvider,
  } = useConnectionActions({ refetchConnections })
  const handleClaimDeletionSuccess = useCallback(() => {
    setDrawerOpen(false)
    setSelectedSkillId(null)
    refetch()
  }, [refetch])
  const {
    isDeletingClaim,
    deleteError,
    clearDeleteError,
    handleDeleteClaim,
  } = useClaimDeletion({
    onSuccess: handleClaimDeletionSuccess,
  })

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
    clearDeleteError()
    setSelectedSkillId(skillId)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedSkillId(null)
    clearDeleteError()
  }

  const handleRerunChecks = useCallback(async () => {
    if (isRerunningChecks) return

    setIsRerunningChecks(true)
    setRerunChecksError(null)

    try {
      const githubConnection = connections.find(
        (connection) => connection.provider === "github",
      )

      if (!githubConnection || githubConnection.status !== "connected") {
        throw new Error("Connect GitHub before re-running checks")
      }

      await runConnectionSyncRequest("github")
      await Promise.all([refetch(), refetchConnections()])
    } catch (error) {
      setRerunChecksError(
        error instanceof Error ? error.message : "Failed to re-run checks",
      )
    } finally {
      setIsRerunningChecks(false)
    }
  }, [connections, isRerunningChecks, refetch, refetchConnections])

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
        isRerunningChecks={isRerunningChecks}
      />
      {rerunChecksError && (
        <p className="text-xs text-destructive">
          {rerunChecksError}
        </p>
      )}

      <ConnectionsPanel
        connections={connections}
        connectionActionInFlight={connectionActionInFlight}
        onConnect={connectProvider}
        onDisconnect={disconnectProvider}
      />
      {connectionActionError && (
        <p className="text-xs text-destructive">
          {connectionActionError}
        </p>
      )}
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
