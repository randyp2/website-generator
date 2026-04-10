"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

import type { ResumeFile } from "./verification.types";
import ResumePreviewCard from "./ResumePreviewCard";
import ResumeUploadGate from "./ResumeUploadGate";
import SkillReviewPanel from "./SkillReviewPanel";

type VerificationSubTab = "resume-review" | "skill-review" | "skill-verification";
const VERIFICATION_SUB_TAB_QUERY_KEY = "verificationTab";
const DEFAULT_VERIFICATION_SUB_TAB: VerificationSubTab = "resume-review";

const isVerificationSubTab = (
    value: string | null,
): value is VerificationSubTab =>
    value === "resume-review" ||
    value === "skill-review" ||
    value === "skill-verification";

interface ResumeVerificationGuardProps {
    children: React.ReactNode;
}

const ResumeVerificationGuard = ({
    children,
}: ResumeVerificationGuardProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [resume, setResume] = useState<ResumeFile | null>(null);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [parsingError, setParsingError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [parsedResumeData, setParsedResumeData] = useState<any>(null);
    const [isLoadingExisting, setIsLoadingExisting] = useState(true);
    const [hasPersistedVerification, setHasPersistedVerification] =
        useState(false);

    const activeTab = isVerificationSubTab(
        searchParams.get(VERIFICATION_SUB_TAB_QUERY_KEY),
    )
        ? searchParams.get(VERIFICATION_SUB_TAB_QUERY_KEY)
        : DEFAULT_VERIFICATION_SUB_TAB;

    const updateVerificationSubTab = useCallback(
        (nextTab: VerificationSubTab) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(VERIFICATION_SUB_TAB_QUERY_KEY, nextTab);
            router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
            });
        },
        [pathname, router, searchParams],
    );

    // Revoke blob URL only on unmount, not on every resume change
    const resumeUrlRef = useRef(resume?.url);
    resumeUrlRef.current = resume?.url;
    useEffect(() => {
        return () => {
            if (resumeUrlRef.current) {
                URL.revokeObjectURL(resumeUrlRef.current);
            }
        };
    }, []);

    // Load existing resume verification on mount
    useEffect(() => {
        const loadExisting = async () => {
            try {
                const response = await fetch(
                    "/api/profile/resume-verification",
                );

                if (!response.ok) {
                    setIsLoadingExisting(false);
                    return;
                }

                const data = await response.json();

                if (!data) {
                    setIsLoadingExisting(false);
                    return;
                }

                // Hydrate state from persisted data
                setHasPersistedVerification(true);
                setResume({
                    name: data.originalFileName ?? "Resume",
                    size: data.fileSizeBytes
                        ? `${(data.fileSizeBytes / 1024).toFixed(1)} KB`
                        : "",
                    url: "",
                    file: new File([], data.originalFileName ?? "Resume"),
                });

                if (data.parsedJson) {
                    setParsedResumeData(data.parsedJson);
                }
            } catch (error) {
                console.error(
                    "Failed to load existing resume verification:",
                    error,
                );
            } finally {
                setIsLoadingExisting(false);
            }
        };

        loadExisting();
    }, []);

    const handleResumeUploaded = (file: ResumeFile) => {
        if (resume?.url) {
            URL.revokeObjectURL(resume.url);
        }

        setResume(file);
        setUploadError(null);
        updateVerificationSubTab("resume-review");
    };

    const handleResumeRemoved = async () => {
        if (resume?.url) {
            URL.revokeObjectURL(resume.url);
        }

        // Delete from DB + storage if persisted
        if (hasPersistedVerification) {
            try {
                await fetch("/api/profile/resume-verification", {
                    method: "DELETE",
                });
            } catch (error) {
                console.error("Failed to delete resume verification:", error);
            }
        }

        setResume(null);
        setParsedResumeData(null);
        setParsingError(null);
        setHasPersistedVerification(false);
        setUploadError(null);
        updateVerificationSubTab("resume-review");
    };

    const parseAndPersist = useCallback(
        async (file: File) => {
            setIsParsingResume(true);
            setParsingError(null);
            setParsedResumeData(null);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const parseResponse = await fetch(
                    "/api/resume/parse?llmFallback=false",
                    {
                        method: "POST",
                        body: formData,
                    },
                );

                if (!parseResponse.ok) {
                    throw new Error("Failed to parse resume");
                }

                const parseData = await parseResponse.json();

                if (parseData.success && parseData.data) {
                    setParsedResumeData(parseData.data);

                    await fetch("/api/profile/resume-verification/parsed", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            extractedText:
                                parseData.data.normalizedText ?? null,
                            parsedJson: parseData.data,
                        }),
                    });
                }
            } catch (error) {
                console.error(
                    "Resume verification parsing failed:",
                    error,
                );
                setParsingError(
                    "Failed to parse resume. You can add skills manually.",
                );
            } finally {
                setIsParsingResume(false);
            }
        },
        [],
    );

    const handleContinueToSkillVerification = useCallback(async () => {
        if (!resume) {
            return;
        }

        // If we already have persisted verification data, skip upload
        if (hasPersistedVerification) {
            updateVerificationSubTab("skill-review");
            return;
        }

        setIsUploadingResume(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", resume.file);

            const response = await fetch(
                "/api/profile/resume-verification/upload",
                {
                    method: "POST",
                    body: formData,
                },
            );

            if (!response.ok) {
                let errorMessage = "Failed to upload resume for verification";

                try {
                    const errorBody = await response.json();
                    if (
                        errorBody &&
                        typeof errorBody === "object" &&
                        "error" in errorBody &&
                        typeof errorBody.error === "string"
                    ) {
                        errorMessage = errorBody.error;
                    }
                } catch {
                    // Fall back to default error message.
                }

                throw new Error(errorMessage);
            }

            setHasPersistedVerification(true);

            // Navigate to skill review and start parsing
            updateVerificationSubTab("skill-review");
            parseAndPersist(resume.file);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to upload resume for verification";
            setUploadError(message);
        } finally {
            setIsUploadingResume(false);
        }
    }, [resume, hasPersistedVerification, updateVerificationSubTab, parseAndPersist]);

    if (isLoadingExisting) {
        return (
            <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!resume) {
        return <ResumeUploadGate onResumeUploaded={handleResumeUploaded} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
                    {[
                        { id: "resume-review", label: "Resume Review" },
                        { id: "skill-review", label: "Skill Review" },
                        {
                            id: "skill-verification",
                            label: "Skill Verification",
                        },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() =>
                                    updateVerificationSubTab(
                                        tab.id as VerificationSubTab,
                                    )
                                }
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

            {activeTab === "resume-review" ? (
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
                                    onClick={handleContinueToSkillVerification}
                                    disabled={isUploadingResume}
                                >
                                    {isUploadingResume
                                        ? "Uploading resume..."
                                        : "Continue to Skill Verification"}
                                </Button>
                                {uploadError ? (
                                    <p className="max-w-xs text-right text-xs text-destructive">
                                        {uploadError}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "skill-review" ? (
                <SkillReviewPanel
                    parsedData={parsedResumeData}
                    isLoading={isParsingResume}
                    parsingError={parsingError}
                    onConfirm={() => {
                        updateVerificationSubTab("skill-verification");
                    }}
                />
            ) : null}

            {activeTab === "skill-verification" ? children : null}
        </div>
    );
};

export default ResumeVerificationGuard;
