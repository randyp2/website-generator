"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
    EvidenceItem,
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

import {
    VerificationEmptyState,
    VerificationErrorState,
} from "./VerificationEmptyState";
import VerificationFilterBar from "./VerificationFilterBar";
import VerificationOverview from "./VerificationOverview";
import ConnectionsPanel from "./ConnectionsPanel";
import SkillLeaderboard from "./SkillLeaderboard";
import SkillCharts from "./SkillCharts";
import SkillDetailDrawer from "./SkillDetailDrawer";
import ScoringTransparency from "./ScoringTransparency";
import ResumeVerificationGuard from "./ResumeVerificationGuard";
import useVerificationSubTab from "./useVerificationSubTab";
import useConnections from "./useConnections";
import useConnectionActions from "./useConnectionActions";
import useClaimDeletion from "./useClaimDeletion";
import useClaims from "./useClaims";
import useEvidence from "./useEvidence";
import {
    useInvalidateVerificationQueries,
    useRunConnectionSyncMutation,
} from "./verification.query";

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

const VerificationTab = ({ userId }: VerificationTabProps) => {
    void userId;

    const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [rerunChecksError, setRerunChecksError] = useState<string | null>(
        null,
    );
    const refreshVerificationData = useInvalidateVerificationQueries();
    const {
        isPending: isRerunningChecks,
        mutateAsync: runConnectionSync,
    } = useRunConnectionSyncMutation();

    const { summary, isInitialLoading, error } = useVerificationSummary();
    const {
        claims,
        isLoading: isClaimsLoading,
        error: claimsError,
    } = useClaims();
    const {
        evidence: rawEvidence,
        isLoading: isEvidenceLoading,
        error: evidenceError,
    } = useEvidence();
    const {
        connections,
        error: connectionsError,
    } = useConnections();
    const {
        connectionActionInFlight,
        connectionActionError,
        connectProvider,
        disconnectProvider,
    } = useConnectionActions();
    const handleClaimDeletionSuccess = useCallback(() => {
        setDrawerOpen(false);
        setSelectedSkillId(null);
    }, []);
    const {
        isDeletingClaim,
        deleteError,
        clearDeleteError,
        handleDeleteClaim,
    } = useClaimDeletion({
        onSuccess: handleClaimDeletionSuccess,
    });

    const { activeTab, openEvidenceDetail } = useVerificationSubTab();

    // Skip refetches on first entry — all hooks already fetch on mount.
    // Only refetch when the user navigates back to this tab after leaving it.
    const hasEnteredSkillVerificationRef = useRef(false);

    useEffect(() => {
        if (activeTab === "skill-verification") {
            if (hasEnteredSkillVerificationRef.current) {
                void refreshVerificationData();
            }
            hasEnteredSkillVerificationRef.current = true;
        }
    }, [
        activeTab,
        refreshVerificationData,
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
            quality: confidenceToQuality(item.evidenceDepth ?? item.linkConfidence),
            linkType: item.linkType,
            linkConfidence: item.linkConfidence,
            evidenceDepth: item.evidenceDepth,
            linkReason: item.reason,
            sourceFile: item.sourceFile,
            metadata: null,
            url: item.sourceUrl,
        }));
    }, [selectedClaim, selectedSkill]);

    const evidenceItems = useMemo<EvidenceItem[]>(() => {
        const toEvidenceItemDate = (e: typeof rawEvidence[0]) =>
            e.occurredAt ?? e.capturedAt ?? e.createdAt;

        return rawEvidence.flatMap((evidence): EvidenceItem[] => {
            const baseDate = toEvidenceItemDate(evidence);
            const baseDescription = evidence.title ?? evidence.description ?? evidence.externalId;

            if (!evidence.links || evidence.links.length === 0) {
                return [{
                    id: evidence.id,
                    evidenceId: evidence.id,
                    skillId: "unlinked",
                    skillName: "Unlinked",
                    type: mapBackendEvidenceTypeToUiType(evidence.evidenceType),
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
                    evidenceDepth: null,
                    linkReason: null,
                    metadata: evidence.metadata,
                    url: evidence.sourceUrl,
                }];
            }

            // One card per evidence row — pick the highest-confidence link.
            const primaryLink = evidence.links.reduce(
                (best, link) => (link.linkConfidence > (best?.linkConfidence ?? -1) ? link : best),
                evidence.links[0],
            );
            const linkedClaim = claimById.get(primaryLink.claimId);
            return [{
                id: evidence.id,
                evidenceId: evidence.id,
                skillId: primaryLink.claimId,
                skillName: linkedClaim?.canonicalSkillName ?? linkedClaim?.rawValue ?? "Linked claim",
                type: mapBackendEvidenceTypeToUiType(evidence.evidenceType),
                source: evidence.provider,
                title: evidence.title,
                externalId: evidence.externalId,
                description: primaryLink.reason ?? baseDescription,
                date: baseDate,
                occurredAt: evidence.occurredAt,
                capturedAt: evidence.capturedAt,
                createdAt: evidence.createdAt,
                updatedAt: evidence.updatedAt,
                quality: confidenceToQuality(primaryLink.evidenceDepth ?? primaryLink.linkConfidence),
                linkType: primaryLink.linkType,
                linkConfidence: primaryLink.linkConfidence,
                evidenceDepth: primaryLink.evidenceDepth,
                linkReason: primaryLink.reason,
                sourceFile: primaryLink.sourceFile,
                metadata: evidence.metadata,
                url: evidence.sourceUrl,
            }];
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

        setRerunChecksError(null);

        try {
            if (!githubConnection || githubConnection.status !== "connected") {
                throw new Error("Connect GitHub before re-running checks");
            }

            await runConnectionSync("github");
        } catch (error) {
            setRerunChecksError(
                error instanceof Error
                    ? error.message
                    : "Failed to re-run checks",
            );
        }
    }, [
        githubConnection,
        isRerunningChecks,
        runConnectionSync,
    ]);

    // Refresh verification data right after claim ingestion succeeds so the
    // first entry into skill-verification reflects new baseline scores.
    const handlePostConfirmRefresh = useCallback(async () => {
        await refreshVerificationData();
    }, [refreshVerificationData]);

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
            {isClaimsLoading && (
                <p className="text-xs text-muted-foreground">
                    Refreshing linked evidence...
                </p>
            )}

            <SkillLeaderboard
                skills={filteredSkills}
                onSkillClick={handleSkillClick}
            />

            <SkillCharts skills={filteredSkills} />

            <ScoringTransparency summary={summary} />

            <SkillDetailDrawer
                skill={selectedSkill}
                evidence={selectedSkillEvidence}
                open={drawerOpen}
                isDeletingClaim={isDeletingClaim}
                deleteError={deleteError}
                onDeleteClaim={handleDeleteClaim}
                onClose={handleDrawerClose}
                onOpenEvidence={openEvidenceDetail}
            />
        </ResumeVerificationGuard>
    );
};

export default VerificationTab;
