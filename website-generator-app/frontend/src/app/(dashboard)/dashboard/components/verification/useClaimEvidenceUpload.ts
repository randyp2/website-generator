"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
    buildClaimEvidenceUploadDescriptorFromFile,
    validateClaimEvidenceUploadDescriptor,
} from "@/lib/verification/claimEvidenceUploadPolicy";
import { invalidateProfileMeQuery } from "@/hooks/useProfileMeQuery";
import { invalidateClaimVerificationQueries } from "./verification.query";

interface PresignResponse {
    uploadId: string;
    uploadUrl: string;
    requiredHeaders: Record<string, string> | null;
}

interface FinalizeResponse {
    upload?: unknown;
    jobId?: string;
}

export interface UploadResult {
    uploadId: string;
    jobId: string | null;
}

interface UseClaimEvidenceUploadResult {
    isTransferring: boolean;
    deletingUploadId: string | null;
    upload: (claimId: string, file: File) => Promise<UploadResult>;
    deleteUpload: (claimId: string, uploadId: string) => Promise<void>;
}

const readErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    try {
        const body = (await response.json()) as { error?: unknown };
        return typeof body.error === "string" ? body.error : fallback;
    } catch {
        return fallback;
    }
};

export const useClaimEvidenceUpload = (): UseClaimEvidenceUploadResult => {
    const queryClient = useQueryClient();
    const [isTransferring, setIsTransferring] = useState(false);
    const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);

    const upload = useCallback(async (claimId: string, file: File): Promise<UploadResult> => {
        const descriptor = buildClaimEvidenceUploadDescriptorFromFile(file);
        const validationError = validateClaimEvidenceUploadDescriptor(descriptor);
        if (validationError) {
            throw new Error(validationError);
        }

        setIsTransferring(true);
        let capturedUploadId = "";
        let verificationJobId: string | null = null;
        try {
            const presignRes = await fetch(
                `/api/profile/resume-verification/claims/${claimId}/evidence-uploads/presign`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(descriptor),
                },
            );

            if (!presignRes.ok) {
                throw new Error(
                    await readErrorMessage(presignRes, "Failed to get upload URL"),
                );
            }

            const { uploadId, uploadUrl, requiredHeaders } =
                (await presignRes.json()) as PresignResponse;
            capturedUploadId = uploadId;

            const r2Res = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": descriptor.contentType,
                    ...requiredHeaders,
                },
            });

            if (!r2Res.ok) {
                throw new Error("File upload to storage failed");
            }

            const finalizeRes = await fetch(
                `/api/profile/resume-verification/claims/${claimId}/evidence-uploads/finalize`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uploadId }),
                },
            );
            void invalidateProfileMeQuery(queryClient);

            if (!finalizeRes.ok) {
                throw new Error(
                    await readErrorMessage(finalizeRes, "Failed to confirm upload"),
                );
            }

            const finalizePayload =
                ((await finalizeRes.json().catch(() => null)) as FinalizeResponse | null) ??
                null;
            verificationJobId =
                typeof finalizePayload?.jobId === "string" &&
                finalizePayload.jobId.trim()
                    ? finalizePayload.jobId.trim()
                    : null;

            void invalidateClaimVerificationQueries(queryClient, claimId);
        } finally {
            setIsTransferring(false);
        }

        return { uploadId: capturedUploadId, jobId: verificationJobId };
    }, [queryClient]);

    const deleteUpload = useCallback(
        async (claimId: string, uploadId: string): Promise<void> => {
            if (!uploadId.trim()) {
                throw new Error("uploadId is required");
            }

            setDeletingUploadId(uploadId);
            try {
                const deleteRes = await fetch(
                    `/api/profile/resume-verification/claims/${claimId}/evidence-uploads/${uploadId}`,
                    {
                        method: "DELETE",
                    },
                );

                if (!deleteRes.ok) {
                    throw new Error(
                        await readErrorMessage(deleteRes, "Failed to delete upload"),
                    );
                }

                void invalidateClaimVerificationQueries(queryClient, claimId);
            } finally {
                setDeletingUploadId(null);
            }
        },
        [queryClient],
    );

    return { isTransferring, deletingUploadId, upload, deleteUpload };
};
