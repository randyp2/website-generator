"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

import ResumePreviewCard from "./ResumePreviewCard";
import ResumeUploadGate from "./ResumeUploadGate";
import SkillReviewPanel from "./SkillReviewPanel";
import VerificationIntro from "./VerificationIntro";
import { VerificationLoadingSpinner } from "./VerificationEmptyState";
import useResumeVerification from "./useResumeVerification";
import useVerificationSubTab from "./useVerificationSubTab";
import type { VerificationSubTab } from "./useVerificationSubTab";
import EvidenceTabPanel from "./evidence/EvidenceTabPanel";
import type { EvidenceItem } from "./verification.types";

// ─── Sub-tab definitions ─────────────────────────────────────────────

const SUB_TABS: { id: VerificationSubTab; label: string }[] = [
    { id: "resume-review", label: "Resume Review" },
    { id: "skill-review", label: "Skill Review" },
    { id: "skill-verification", label: "Skill Verification" },
    { id: "evidence", label: "Evidence" },
];

// ─── Component ───────────────────────────────────────────────────────

interface ResumeVerificationGuardProps {
    children: React.ReactNode;
    isExternalLoading?: boolean;
    onPostConfirmRefresh?: () => Promise<void> | void;
    evidence?: EvidenceItem[];
    isEvidenceLoading?: boolean;
    evidenceError?: string | null;
}

/**
 * Top-level orchestrator for the verification sub-tab.
 *
 * Renders one of two states:
 * 1. **Loading** — while hydrating an existing verification from the backend.
 * 2. **Sub-tab workspace** — always shows Resume Review / Skill Review /
 *    Skill Verification, with empty-state content inside tabs when needed.
 *
 * All state management lives in `useResumeVerification`; tab routing
 * lives in `useVerificationSubTab`. This component is purely presentational.
 */
const ResumeVerificationGuard = ({
    children,
    isExternalLoading = false,
    onPostConfirmRefresh,
    evidence = [],
    isEvidenceLoading = false,
    evidenceError = null,
}: ResumeVerificationGuardProps) => {
    const { activeTab, setActiveTab, hasExplicitTab } = useVerificationSubTab();
    const setActiveTabAndTrack = useCallback(
        (tab: VerificationSubTab) => {
            setActiveTab(tab);
        },
        [setActiveTab],
    );

    const {
        resume,
        isUploading,
        uploadError,
        isParsing,
        parsingError,
        parsedData,
        resumeUpdatedAt,
        isLoadingExisting,
        hasPersisted,
        isIngesting,
        ingestError,
        handleResumeUploaded,
        handleResumeRemoved,
        handleContinueToSkillVerification,
        handleConfirmSkills,
        saveReview,
    } = useResumeVerification(setActiveTabAndTrack, {
        onConfirmIngested: onPostConfirmRefresh,
    });

    // ── Redirect returning users straight to skill-verification ──────
    // If the user has already completed the flow and arrives without an
    // explicit tab param, skip the setup steps and land on the analyzer.
    useEffect(() => {
        if (!isLoadingExisting && hasPersisted && !hasExplicitTab) {
            setActiveTab("skill-verification");
        }
    }, [isLoadingExisting, hasPersisted, hasExplicitTab, setActiveTab]);

    // ── Single loading gate ──────────────────────────────────────────
    // Block render while: external data (summary) is loading, the
    // resume-verification GET is in-flight, OR hydration is done but
    // the redirect to skill-verification hasn't landed in the URL yet
    // (hasPersisted && !hasExplicitTab). That last condition prevents
    // a one-frame flash of the resume-review tab before router.replace fires.
    if (
        isExternalLoading ||
        isLoadingExisting ||
        (hasPersisted && !hasExplicitTab)
    ) {
        return <VerificationLoadingSpinner />;
    }

    const resumeUploadPrompt = (
        <div className="flex min-h-[calc(100vh-10rem)]">
            <div className="flex flex-1 flex-col justify-center pr-10">
                <VerificationIntro />
            </div>
            <div className="w-px shrink-0 bg-border" />
            <div className="flex flex-1 flex-col justify-center pl-10">
                <ResumeUploadGate onResumeUploaded={handleResumeUploaded} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Sub-tab bar — all verification tabs remain available. */}
            <div className="flex gap-6 border-b border-border">
                {SUB_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTabAndTrack(tab.id)}
                            className={`pb-3 text-sm font-medium transition-colors hover:cursor-pointer ${
                                isActive
                                    ? "border-b-2 border-primary text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Step 1 — Review the uploaded resume and continue to parsing */}
            {activeTab === "resume-review" && (
                resume ? (
                    <div className="space-y-6">
                        <ResumePreviewCard
                            resume={resume}
                            onRemove={handleResumeRemoved}
                        />

                        <div className="rounded-xl border bg-card p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Resume ready for verification
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Review the uploaded file, then continue
                                        to open the skill verification workspace
                                        and evidence preview.
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Button
                                        onClick={handleContinueToSkillVerification}
                                        disabled={isUploading}
                                        className="hover:cursor-pointer"
                                    >
                                        {isUploading
                                            ? "Uploading resume..."
                                            : "Continue to Skill Verification"}
                                    </Button>
                                    {uploadError && (
                                        <p className="max-w-xs text-right text-xs text-destructive">
                                            {uploadError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    resumeUploadPrompt
                )
            )}

            {/* Step 2 — Review / edit extracted skills before verification */}
            {activeTab === "skill-review" && (
                <SkillReviewPanel
                    parsedData={parsedData}
                    lastUpdatedAt={resumeUpdatedAt}
                    isLoading={isParsing}
                    parsingError={parsingError}
                    isIngesting={isIngesting}
                    ingestError={ingestError}
                    onSave={saveReview}
                    onConfirm={(skills, experiences) =>
                        handleConfirmSkills(skills, experiences)
                    }
                />
            )}

            {/* Step 3 — The actual verification UI (passed as children) */}
            {activeTab === "skill-verification" && children}

            {/* Evidence tab — document manager for all uploaded and linked evidence */}
            {activeTab === "evidence" && (
                <EvidenceTabPanel
                    evidence={evidence}
                    isLoading={isEvidenceLoading}
                    error={evidenceError}
                />
            )}
        </div>
    );
};

export default ResumeVerificationGuard;
