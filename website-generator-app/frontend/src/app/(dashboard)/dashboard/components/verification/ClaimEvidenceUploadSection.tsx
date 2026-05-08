"use client";

import { useRef } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { CLAIM_EVIDENCE_ACCEPT_ATTR } from "@/lib/verification/claimEvidenceUploadPolicy";
import { useClaimEvidenceUpload } from "./useClaimEvidenceUpload";
import { useClaimUploads } from "./useClaimUploads";

interface ClaimEvidenceUploadSectionProps {
    claimId: string;
}

const ClaimEvidenceUploadSection = ({
    claimId,
}: ClaimEvidenceUploadSectionProps) => {
    const { addToast } = useToast();
    const { isUploading, deletingUploadId, upload, deleteUpload } =
        useClaimEvidenceUpload();
    const { uploads, refetch: refetchUploads } = useClaimUploads(claimId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        try {
            await upload(claimId, file);
            await refetchUploads();
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
                disabled={isUploading || deletingUploadId !== null}
            />
            {uploads.length > 0 ? (
                <div className="space-y-1">
                    {uploads.map((u) => (
                        <div
                            key={u.id}
                            className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted"
                        >
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-foreground truncate flex-1">
                                {u.originalFileName}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    handleDeleteUpload(u.id, u.originalFileName)
                                }
                                disabled={isUploading || deletingUploadId !== null}
                                aria-label={`Delete ${u.originalFileName}`}
                                className={cn(
                                    "inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-red-500 transition-colors",
                                    (isUploading || deletingUploadId !== null) &&
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
                    ))}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || deletingUploadId !== null}
                        className={cn(
                            "flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:cursor-pointer",
                            (isUploading || deletingUploadId !== null) &&
                                "pointer-events-none opacity-60",
                        )}
                    >
                        {isUploading ? (
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
                        !isUploading &&
                        deletingUploadId === null &&
                        fileInputRef.current?.click()
                    }
                    onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !isUploading &&
                        deletingUploadId === null &&
                        fileInputRef.current?.click()
                    }
                    className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-md border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors",
                        (isUploading || deletingUploadId !== null) &&
                            "pointer-events-none opacity-60",
                    )}
                >
                    {isUploading ? (
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
