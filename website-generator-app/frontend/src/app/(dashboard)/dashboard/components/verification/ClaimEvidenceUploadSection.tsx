"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, FileText, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { CLAIM_EVIDENCE_ACCEPT_ATTR } from "@/lib/verification/claimEvidenceUploadPolicy";
import { useClaimEvidenceUpload } from "./useClaimEvidenceUpload";
import { useClaimUploads } from "./useClaimUploads";
import type { AssetVerificationSummarySelection } from "./verification.types";

interface ClaimEvidenceUploadSectionProps {
    claimId: string;
    onSelectAssetSummary?: (selection: AssetVerificationSummarySelection) => void;
    onUploadComplete?: (uploadId: string, jobId: string | null, fileName: string) => void;
}

interface ParsedAssetVerificationSummary {
    confidence: number;
    summary: string;
}

const extractAssetVerificationSummary = (
    metadata: Record<string, unknown> | null | undefined,
): ParsedAssetVerificationSummary | null => {
    if (!metadata || typeof metadata !== "object") {
        return null;
    }

    const assetVerification = metadata.assetVerification;
    if (!assetVerification || typeof assetVerification !== "object") {
        return null;
    }

    const record = assetVerification as Record<string, unknown>;
    const confidence =
        typeof record.confidence === "number" && Number.isFinite(record.confidence)
            ? Math.max(0, Math.min(1, record.confidence))
            : null;
    const summary =
        typeof record.summary === "string" && record.summary.trim().length > 0
            ? record.summary.trim()
            : null;

    if (confidence === null || !summary) {
        return null;
    }

    return { confidence, summary };
};

const formatConfidencePercent = (confidence: number): string =>
    `${Math.round(confidence * 100)}%`;

const ClaimEvidenceUploadSection = ({
    claimId,
    onSelectAssetSummary,
    onUploadComplete,
}: ClaimEvidenceUploadSectionProps) => {
    const { addToast } = useToast();
    const { isTransferring, deletingUploadId, upload, deleteUpload } =
        useClaimEvidenceUpload();
    const { uploads, refetch: refetchUploads } = useClaimUploads(claimId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isTransferring) {
            return;
        }

        void refetchUploads();
        const intervalId = window.setInterval(() => {
            void refetchUploads();
        }, 1500);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isTransferring, refetchUploads]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        try {
            const result = await upload(claimId, file);
            await refetchUploads();
            onUploadComplete?.(result.uploadId, result.jobId, file.name);
            addToast({
                type: "success",
                title: "Upload Successful",
                description: `${file.name} has been added as evidence.`,
            });
        } catch (error) {
            addToast({
                type: "error",
                title: "Upload Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again.",
            });
        }
    };

    const handleDeleteUpload = async (uploadId: string, fileName: string) => {
        try {
            await deleteUpload(claimId, uploadId);
            await refetchUploads();
            addToast({
                type: "success",
                title: "Upload Deleted",
                description: `${fileName} has been removed.`,
            });
        } catch (error) {
            addToast({
                type: "error",
                title: "Delete Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again.",
            });
        }
    };

    const handleDownloadUpload = async (uploadId: string) => {
        try {
            const response = await fetch(
                `/api/profile/resume-verification/claims/${claimId}/evidence-uploads/${uploadId}/download-url`,
                {
                    method: "GET",
                },
            );
            if (!response.ok) return;

            const payload = (await response.json()) as { downloadUrl?: unknown };
            if (typeof payload.downloadUrl !== "string" || !payload.downloadUrl) return;

            const anchor = document.createElement("a");
            anchor.href = payload.downloadUrl;
            anchor.rel = "noopener";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
        } catch {
            // Intentionally silent: no toast/no extra UX on download failure.
        }
    };

    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Upload Evidence
            </h4>
            <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept={CLAIM_EVIDENCE_ACCEPT_ATTR}
                onChange={handleFileChange}
                disabled={isTransferring || deletingUploadId !== null}
            />
            {uploads.length > 0 ? (
                <div className="space-y-1">
                    {uploads.map((u) => {
                        const verificationSummary = extractAssetVerificationSummary(
                            u.metadata,
                        );
                        const normalizedStatus = u.status.trim().toLowerCase();
                        const isFailed = normalizedStatus === "failed";
                        const isProcessing = !isFailed && verificationSummary === null;
                        const canOpenSummary = Boolean(
                            verificationSummary && onSelectAssetSummary,
                        );
                        const confidenceText = verificationSummary
                            ? `Confidence ${formatConfidencePercent(
                                  verificationSummary.confidence,
                              )}`
                            : "Awaiting confidence";

                        return (
                            <div
                                key={u.id}
                                className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!verificationSummary || !onSelectAssetSummary) {
                                            return;
                                        }
                                        onSelectAssetSummary({
                                            claimId,
                                            uploadId: u.id,
                                            originalFileName: u.originalFileName,
                                            confidence: verificationSummary.confidence,
                                            summary: verificationSummary.summary,
                                        });
                                    }}
                                    disabled={!canOpenSummary}
                                    className={cn(
                                        "group flex min-w-0 flex-1 items-center gap-2 text-left",
                                        canOpenSummary
                                            ? "hover:cursor-pointer"
                                            : "cursor-default",
                                    )}
                                >
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={cn(
                                                "text-xs text-foreground truncate",
                                                !(isTransferring || deletingUploadId !== null) &&
                                                    "hover:underline cursor-pointer",
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isTransferring || deletingUploadId !== null) return;
                                                void handleDownloadUpload(u.id);
                                            }}
                                        >
                                            {u.originalFileName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {isProcessing
                                                ? "AI verification in progress..."
                                                : isFailed
                                                  ? u.analysisError?.trim() ||
                                                    "AI verification failed"
                                                  : confidenceText}
                                        </p>
                                    </div>
                                    {isProcessing ? (
                                        <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin shrink-0" />
                                    ) : isFailed ? (
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    )}
                                    <ChevronRight
                                        className={cn(
                                            "h-3.5 w-3.5 text-muted-foreground transition-opacity shrink-0",
                                            canOpenSummary
                                                ? "opacity-0 group-hover:opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteUpload(u.id, u.originalFileName)
                                    }
                                    disabled={isTransferring || deletingUploadId !== null}
                                    aria-label={`Delete ${u.originalFileName}`}
                                    className={cn(
                                        "inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-red-500 hover:cursor-pointer transition-colors",
                                        (isTransferring || deletingUploadId !== null) &&
                                            "pointer-events-none opacity-50",
                                    )}
                                >
                                    {deletingUploadId === u.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <X className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTransferring || deletingUploadId !== null}
                        className={cn(
                            "flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:cursor-pointer",
                            (isTransferring || deletingUploadId !== null) &&
                                "pointer-events-none opacity-60",
                        )}
                    >
                        {isTransferring ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "+ Upload Evidence"
                        )}
                    </button>
                </div>
            ) : (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        !isTransferring &&
                        deletingUploadId === null &&
                        fileInputRef.current?.click()
                    }
                    onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !isTransferring &&
                        deletingUploadId === null &&
                        fileInputRef.current?.click()
                    }
                    className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-md border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors",
                        (isTransferring || deletingUploadId !== null) &&
                            "pointer-events-none opacity-60",
                    )}
                >
                    {isTransferring ? (
                        <>
                            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                            <p className="text-xs text-muted-foreground">
                                Uploading...
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground text-center">
                                Click to upload a file
                                <br />
                                <span className="text-[10px]">
                                    PDF, PNG, JPG, JPEG, or TXT
                                </span>
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClaimEvidenceUploadSection;
