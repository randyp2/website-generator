"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
    EvidenceItem,
    EvidenceType,
    FilterOption,
    QualityFlag,
    VerificationTabProps,
} from "./verification.types";
import {
    deriveOverviewFromSummary,
    filterSkills,
    mapBackendEvidenceTypeToUiType,
    mapSummaryClaimsToSkillVerifications,
} from "./verification.utils";
import useVerificationSummary from "./useVerificationSummary";
import type { ClaimDTO } from "@/types/claim";
import type { EvidenceDTO } from "@/types/evidence";

import {
    VerificationEmptyState,
    VerificationErrorState,
} from "./VerificationEmptyState";
import VerificationFilterBar from "./VerificationFilterBar";
import VerificationOverview from "./VerificationOverview";
import ConnectionsPanel from "./ConnectionsPanel";
import SkillLeaderboard from "./SkillLeaderboard";
import SkillCharts from "./SkillCharts";
import EvidenceTable from "./EvidenceTable";
import SkillDetailDrawer from "./SkillDetailDrawer";
import ScoringTransparency from "./ScoringTransparency";
import ResumeVerificationGuard from "./ResumeVerificationGuard";
import useVerificationSubTab from "./useVerificationSubTab";
import useConnections from "./useConnections";
import useConnectionActions from "./useConnectionActions";
import useClaimDeletion from "./useClaimDeletion";
import useClaims from "./useClaims";
import useEvidence from "./useEvidence";
import { runConnectionSyncRequest } from "./verification.api";

const confidenceToQuality = (
    confidence: number | null | undefined,
): QualityFlag => {
    if (typeof confidence !== "number") {
        return "low";
    }
    if (confidence >= 0.85) {
        return "high";
    }
    if (confidence >= 0.6) {
        return "medium";
    }
    return "low";
};

const toEvidenceItemDate = (evidence: EvidenceDTO): string =>
    evidence.occurredAt ?? evidence.capturedAt ?? evidence.createdAt;

const VerificationTab = ({ userId }: VerificationTabProps) => {
    void userId;

    const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
    const [activeEvidenceTypeFilter, setActiveEvidenceTypeFilter] = useState<
        EvidenceType | "all"
    >("all");
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isRerunningChecks, setIsRerunningChecks] = useState(false);
    const [rerunChecksError, setRerunChecksError] = useState<string | null>(
        null,
    );

    const { summary, isInitialLoading, error, refetch } = useVerificationSummary();
    const {
        claims,
        isLoading: isClaimsLoading,
        error: claimsError,
        refetch: refetchClaims,
    } = useClaims();
    const {
        evidence: rawEvidence,
        isLoading: isEvidenceLoading,
        error: evidenceError,
        refetch: refetchEvidence,
    } = useEvidence();
    const {
        connections,
        error: connectionsError,
        refetch: refetchConnections,
    } = useConnections();
    const {
        connectionActionInFlight,
        connectionActionError,
        connectProvider,
        disconnectProvider,
    } = useConnectionActions({ refetchConnections });
    const handleClaimDeletionSuccess = useCallback(() => {
        setDrawerOpen(false);
        setSelectedSkillId(null);
        refetch();
        refetchClaims();
        refetchEvidence();
    }, [refetch, refetchClaims, refetchEvidence]);
    const {
        isDeletingClaim,
        deleteError,
        clearDeleteError,
        handleDeleteClaim,
    } = useClaimDeletion({
        onSuccess: handleClaimDeletionSuccess,
    });

    const { activeTab } = useVerificationSubTab();

    // Skip refetches on first entry — all hooks already fetch on mount.
    // Only refetch when the user navigates back to this tab after leaving it.
    const hasEnteredSkillVerificationRef = useRef(false);

    useEffect(() => {
        if (activeTab === "skill-verification") {
            if (hasEnteredSkillVerificationRef.current) {
                refetch();
                refetchClaims();
                refetchEvidence();
                refetchConnections();
            }
            hasEnteredSkillVerificationRef.current = true;
        }
    }, [
        activeTab,
        refetch,
        refetchClaims,
        refetchConnections,
        refetchEvidence,
    ]);

    const claimById = useMemo(
        () => new Map(claims.map((claim) => [claim.id, claim])),
        [claims],
    );

    const skills = useMemo(
        () =>
            summary
                ? mapSummaryClaimsToSkillVerifications(
                      summary.claims,
                      summary.suggestedActions,
                      summary.generatedAt,
                      claimById,
                  )
                : [],
        [summary, claimById],
    );

    const overview = useMemo(
        () => (summary ? deriveOverviewFromSummary(summary) : null),
        [summary],
    );

    const filteredSkills = useMemo(
        () => filterSkills(skills, activeFilter),
        [skills, activeFilter],
    );

    const githubConnection = useMemo(
        () =>
            connections.find((connection) => connection.provider === "github")
            ?? null,
        [connections],
    );

    const lastRerunAt = useMemo(
        () =>
            githubConnection?.lastSyncCompletedAt
            ?? githubConnection?.lastSyncedAt
            ?? null,
        [githubConnection],
    );

    const selectedSkill = useMemo(
        () => skills.find((s) => s.id === selectedSkillId) ?? null,
        [skills, selectedSkillId],
    );
    const selectedClaim = useMemo(
        () =>
            selectedSkillId ? (claimById.get(selectedSkillId) ?? null) : null,
        [claimById, selectedSkillId],
    );

    const selectedSkillEvidence = useMemo<EvidenceItem[]>(() => {
        if (!selectedClaim || !selectedSkill) {
            return [];
        }
        return selectedClaim.evidenceSummary.linkedEvidence.map((item) => ({
            id: `${selectedClaim.id}:${item.evidenceId}`,
            evidenceId: item.evidenceId,
            skillId: selectedClaim.id,
            skillName: selectedSkill.name,
            type: mapBackendEvidenceTypeToUiType(item.evidenceType),
            source: item.provider,
            title: item.title,
            externalId: item.externalId,
            description: item.title ?? item.reason ?? item.externalId,
            date: item.capturedAt ?? selectedClaim.updatedAt,
            occurredAt: null,
            capturedAt: item.capturedAt,
            createdAt: null,
            updatedAt: selectedClaim.updatedAt,
            quality: confidenceToQuality(item.linkConfidence),
            linkType: item.linkType,
            linkConfidence: item.linkConfidence,
            linkReason: item.reason,
            metadata: null,
            url: item.sourceUrl,
        }));
    }, [selectedClaim, selectedSkill]);

    const evidenceItems = useMemo<EvidenceItem[]>(() => {
        return rawEvidence.flatMap((evidence): EvidenceItem[] => {
            const baseType = mapBackendEvidenceTypeToUiType(
                evidence.evidenceType,
            );
            const baseDescription =
                evidence.title ?? evidence.description ?? evidence.externalId;
            const baseDate = toEvidenceItemDate(evidence);

            if (!evidence.links || evidence.links.length === 0) {
                return [
                    {
                        id: evidence.id,
                        evidenceId: evidence.id,
                        skillId: "unlinked",
                        skillName: "Unlinked",
                        type: baseType,
                        source: evidence.provider,
                        title: evidence.title,
                        externalId: evidence.externalId,
                        description: baseDescription,
                        date: baseDate,
                        occurredAt: evidence.occurredAt,
                        capturedAt: evidence.capturedAt,
                        createdAt: evidence.createdAt,
                        updatedAt: evidence.updatedAt,
                        quality: "low",
                        linkType: null,
                        linkConfidence: null,
                        linkReason: null,
                        metadata: evidence.metadata,
                        url: evidence.sourceUrl,
                    },
                ];
            }

            return evidence.links.map((link) => {
                const linkedClaim: ClaimDTO | undefined = claimById.get(
                    link.claimId,
                );
                return {
                    id: `${evidence.id}:${link.claimId}`,
                    evidenceId: evidence.id,
                    skillId: link.claimId,
                    skillName:
                        linkedClaim?.canonicalSkillName ??
                        linkedClaim?.rawValue ??
                        "Linked claim",
                    type: baseType,
                    source: evidence.provider,
                    title: evidence.title,
                    externalId: evidence.externalId,
                    description: link.reason ?? baseDescription,
                    date: baseDate,
                    occurredAt: evidence.occurredAt,
                    capturedAt: evidence.capturedAt,
                    createdAt: evidence.createdAt,
                    updatedAt: evidence.updatedAt,
                    quality: confidenceToQuality(link.linkConfidence),
                    linkType: link.linkType,
                    linkConfidence: link.linkConfidence,
                    linkReason: link.reason,
                    metadata: evidence.metadata,
                    url: evidence.sourceUrl,
                };
            });
        });
    }, [rawEvidence, claimById]);

    const filterCounts = useMemo<Record<FilterOption, number>>(
        () => ({
            all: skills.length,
            verified: skills.filter((s) => s.status === "verified").length,
            needs_action: skills.filter((s) => s.status === "needs_action")
                .length,
            conflicts: skills.filter((s) => s.status === "conflict").length,
        }),
        [skills],
    );

    const handleSkillClick = (skillId: string) => {
        clearDeleteError();
        setSelectedSkillId(skillId);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedSkillId(null);
        clearDeleteError();
    };

    const handleRerunChecks = useCallback(async () => {
        if (isRerunningChecks) return;

        setIsRerunningChecks(true);
        setRerunChecksError(null);

        try {
            if (!githubConnection || githubConnection.status !== "connected") {
                throw new Error("Connect GitHub before re-running checks");
            }

            await runConnectionSyncRequest("github");

            // Currently refetch data
            await Promise.all([
                refetch(),
                refetchConnections(),
                refetchClaims(),
                refetchEvidence(),
            ]);
        } catch (error) {
            setRerunChecksError(
                error instanceof Error
                    ? error.message
                    : "Failed to re-run checks",
            );
        } finally {
            setIsRerunningChecks(false);
        }
    }, [
        githubConnection,
        isRerunningChecks,
        refetch,
        refetchClaims,
        refetchConnections,
        refetchEvidence,
    ]);

    // Refresh verification data right after claim ingestion succeeds so the
    // first entry into skill-verification reflects new baseline scores.
    const handlePostConfirmRefresh = useCallback(async () => {
        await Promise.all([
            refetch(),
            refetchClaims(),
            refetchEvidence(),
            refetchConnections(),
        ]);
    }, [refetch, refetchClaims, refetchEvidence, refetchConnections]);

    if (error) {
        return (
            <VerificationErrorState onRetry={() => window.location.reload()} />
        );
    }

    if (!summary || summary.totalSkills === 0 || !overview) {
        return (
            <ResumeVerificationGuard
                isExternalLoading={isInitialLoading}
                onPostConfirmRefresh={handlePostConfirmRefresh}
                evidence={evidenceItems}
                isEvidenceLoading={isEvidenceLoading}
                evidenceError={evidenceError}
            >
                <VerificationEmptyState />
            </ResumeVerificationGuard>
        );
    }

    return (
        <ResumeVerificationGuard
            isExternalLoading={isInitialLoading}
            onPostConfirmRefresh={handlePostConfirmRefresh}
            evidence={evidenceItems}
            isEvidenceLoading={isEvidenceLoading}
            evidenceError={evidenceError}
        >
            <VerificationOverview
                data={overview}
                lastRerunAt={lastRerunAt}
                onRerunChecks={handleRerunChecks}
                isRerunningChecks={isRerunningChecks}
            />
            {rerunChecksError && (
                <p className="text-xs text-destructive">{rerunChecksError}</p>
            )}

            <VerificationFilterBar
                active={activeFilter}
                counts={filterCounts}
                onChange={setActiveFilter}
            />

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
                    Could not refresh connection state. Showing cached/default
                    values.
                </p>
            )}
            {claimsError && (
                <p className="text-xs text-muted-foreground">
                    Could not refresh claim evidence links yet.
                </p>
            )}
            {evidenceError && (
                <p className="text-xs text-muted-foreground">
                    Could not refresh evidence list yet.
                </p>
            )}
            {(isClaimsLoading || isEvidenceLoading) && (
                <p className="text-xs text-muted-foreground">
                    Refreshing linked evidence...
                </p>
            )}

            <SkillLeaderboard
                skills={filteredSkills}
                onSkillClick={handleSkillClick}
            />

            <SkillCharts skills={filteredSkills} />
            <EvidenceTable
                evidence={evidenceItems}
                activeTypeFilter={activeEvidenceTypeFilter}
                onTypeFilterChange={setActiveEvidenceTypeFilter}
            />

            <ScoringTransparency summary={summary} />

            <SkillDetailDrawer
                skill={selectedSkill}
                evidence={selectedSkillEvidence}
                open={drawerOpen}
                isDeletingClaim={isDeletingClaim}
                deleteError={deleteError}
                onDeleteClaim={handleDeleteClaim}
                onClose={handleDrawerClose}
            />
        </ResumeVerificationGuard>
    );
};

export default VerificationTab;
