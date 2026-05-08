"use client";

import { useRef } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { useClaimEvidenceUpload } from "./useClaimEvidenceUpload";
import { useClaimUploads } from "./useClaimUploads";

interface ClaimEvidenceUploadSectionProps {
    claimId: string;
}

const ACCEPTED_FILE_TYPES = ".pdf,.png,.jpg,.jpeg,.gif,.mp4,.mov,.doc,.docx";

const ClaimEvidenceUploadSection = ({
    claimId,
}: ClaimEvidenceUploadSectionProps) => {
    const { addToast } = useToast();
    const { isUploading, upload } = useClaimEvidenceUpload();
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
        } catch {
            addToast({
                type: "error",
                title: "Upload Failed",
                description: "Something went wrong. Please try again.",
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
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileChange}
                disabled={isUploading}
            />
            {uploads.length > 0 ? (
                <div className="space-y-1">
                    {uploads.map((u) => (
                        <div
                            key={u.id}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                        >
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-foreground truncate">
                                {u.originalFileName}
                            </span>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                            "flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:cursor-pointer",
                            isUploading && "pointer-events-none opacity-60",
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
                        !isUploading && fileInputRef.current?.click()
                    }
                    onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !isUploading &&
                        fileInputRef.current?.click()
                    }
                    className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-md border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors",
                        isUploading && "pointer-events-none opacity-60",
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
                                    PDF, images, video, or documents
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
