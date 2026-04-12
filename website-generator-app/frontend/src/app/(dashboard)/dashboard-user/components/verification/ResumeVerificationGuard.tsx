"use client";

import { Button } from "@/components/ui/button";

import ResumePreviewCard from "./ResumePreviewCard";
import ResumeUploadGate from "./ResumeUploadGate";
import SkillReviewPanel from "./SkillReviewPanel";
import useResumeVerification from "./useResumeVerification";
import useVerificationSubTab from "./useVerificationSubTab";
import type { VerificationSubTab } from "./useVerificationSubTab";

// ─── Sub-tab definitions ─────────────────────────────────────────────

const SUB_TABS: { id: VerificationSubTab; label: string }[] = [
    { id: "resume-review", label: "Resume Review" },
    { id: "skill-review", label: "Skill Review" },
    { id: "skill-verification", label: "Skill Verification" },
];

// ─── Component ───────────────────────────────────────────────────────

interface ResumeVerificationGuardProps {
    children: React.ReactNode;
}

/**
 * Top-level orchestrator for the verification sub-tab.
 *
 * Renders one of three states:
 * 1. **Loading** — while hydrating an existing verification from the backend.
 * 2. **Upload gate** — when no resume is present (first visit).
 * 3. **Sub-tab workspace** — once a resume is loaded, shows a tab bar with
 *    Resume Review / Skill Review / Skill Verification panels.
 *
 * All state management lives in `useResumeVerification`; tab routing
 * lives in `useVerificationSubTab`. This component is purely presentational.
 */
const ResumeVerificationGuard = ({
    children,
}: ResumeVerificationGuardProps) => {
    const { activeTab, setActiveTab } = useVerificationSubTab();

    const {
        resume,
        isUploading,
        uploadError,
        isParsing,
        parsingError,
        parsedData,
        isLoadingExisting,
        handleResumeUploaded,
        handleResumeRemoved,
        handleContinueToSkillVerification,
    } = useResumeVerification(setActiveTab);

    // ── Loading spinner while hydrating existing data ────────────────

    if (isLoadingExisting) {
        return (
            <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    // ── No resume yet — show drag-and-drop upload gate ──────────────

    if (!resume) {
        return <ResumeUploadGate onResumeUploaded={handleResumeUploaded} />;
    }

    // ── Resume present — render the three-step sub-tab workspace ────

    return (
        <div className="space-y-8">
            {/* Sub-tab bar */}
            <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
                {SUB_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-background text-foreground shadow-sm"
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
                <div className="space-y-8">
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
                                    Review the uploaded file, then continue to
                                    open the skill verification workspace and
                                    evidence preview.
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Button
                                    onClick={
                                        handleContinueToSkillVerification
                                    }
                                    disabled={isUploading}
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
            )}

            {/* Step 2 — Review / edit extracted skills before verification */}
            {activeTab === "skill-review" && (
                <SkillReviewPanel
                    parsedData={parsedData}
                    isLoading={isParsing}
                    parsingError={parsingError}
                    onConfirm={() => setActiveTab("skill-verification")}
                />
            )}

            {/* Step 3 — The actual verification UI (passed as children) */}
            {activeTab === "skill-verification" && children}
        </div>
    );
};

export default ResumeVerificationGuard;
