"use client";

import { useCallback, useMemo, useState } from "react";

import type {
    EvidenceItem,
    EvidenceType,
    FilterOption,
    QualityFlag,
} from "@/app/(dashboard)/dashboard/components/verification/verification.types";
import {
    deriveOverviewFromSummary,
    filterSkills,
    mapBackendEvidenceTypeToUiType,
    mapSummaryClaimsToSkillVerifications,
} from "@/app/(dashboard)/dashboard/components/verification/verification.utils";
import type { ClaimDTO } from "@/types/claim";
import type { EvidenceDTO } from "@/types/evidence";
import ConnectionsPanel from "@/app/(dashboard)/dashboard/components/verification/ConnectionsPanel";
import EvidenceTable from "@/app/(dashboard)/dashboard/components/verification/EvidenceTable";
import ScoringTransparency from "@/app/(dashboard)/dashboard/components/verification/ScoringTransparency";
import SkillCharts from "@/app/(dashboard)/dashboard/components/verification/SkillCharts";
import SkillDetailDrawer from "@/app/(dashboard)/dashboard/components/verification/SkillDetailDrawer";
import SkillLeaderboard from "@/app/(dashboard)/dashboard/components/verification/SkillLeaderboard";
import VerificationFilterBar from "@/app/(dashboard)/dashboard/components/verification/VerificationFilterBar";
import {
    VerificationErrorState,
    VerificationLoadingSkeleton,
} from "@/app/(dashboard)/dashboard/components/verification/VerificationEmptyState";
import VerificationOverview from "@/app/(dashboard)/dashboard/components/verification/VerificationOverview";

import {
    usePublicClaims,
    usePublicConnections,
    usePublicEvidence,
    usePublicVerificationSummary,
} from "./usePublicVerification";

type PublicVerificationTabProps = {
    username: string;
};

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

const PublicVerificationTab = ({ username }: PublicVerificationTabProps) => {
    const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
    const [activeEvidenceTypeFilter, setActiveEvidenceTypeFilter] = useState<
        EvidenceType | "all"
    >("all");
    const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { summary, isLoading, error, refetch } = usePublicVerificationSummary(
        username,
    );
    const {
        claims,
        isLoading: isClaimsLoading,
        error: claimsError,
    } = usePublicClaims(username);
    const {
        evidence: rawEvidence,
        isLoading: isEvidenceLoading,
        error: evidenceError,
    } = usePublicEvidence(username);
    const {
        connections,
        error: connectionsError,
    } = usePublicConnections(username);

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
        () => skills.find((skill) => skill.id === selectedSkillId) ?? null,
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
            sourceFile: item.sourceFile,
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
                        linkedClaim?.canonicalSkillName
                        ?? linkedClaim?.rawValue
                        ?? "Linked claim",
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
                    sourceFile: link.sourceFile,
                    metadata: evidence.metadata,
                    url: evidence.sourceUrl,
                };
            });
        });
    }, [rawEvidence, claimById]);

    const filterCounts = useMemo<Record<FilterOption, number>>(
        () => ({
            all: skills.length,
            verified: skills.filter((skill) => skill.status === "verified")
                .length,
            needs_action: skills.filter((skill) => skill.status === "needs_action")
                .length,
            conflicts: skills.filter((skill) => skill.status === "conflict")
                .length,
        }),
        [skills],
    );

    const handleSkillClick = (skillId: string) => {
        setSelectedSkillId(skillId);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedSkillId(null);
    };

    const noop = useCallback(async () => {}, []);

    if (isLoading) {
        return <VerificationLoadingSkeleton />;
    }

    if (error) {
        return <VerificationErrorState onRetry={refetch} />;
    }

    if (!summary || summary.totalSkills === 0 || !overview) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg font-medium text-foreground">
                    No public verification data yet.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    This profile has not published verification signals yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <VerificationOverview
                data={overview}
                lastRerunAt={lastRerunAt}
                onRerunChecks={noop}
                showActions={false}
            />

            <VerificationFilterBar
                active={activeFilter}
                counts={filterCounts}
                onChange={setActiveFilter}
            />

            <ConnectionsPanel
                connections={connections}
                readOnly
                onConnect={() => {}}
                onDisconnect={() => {}}
            />
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
                isDeletingClaim={false}
                deleteError={null}
                showClaimControls={false}
                onDeleteClaim={noop}
                onClose={handleDrawerClose}
            />
        </div>
    );
};

export default PublicVerificationTab;
