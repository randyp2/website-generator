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
    isInsufficientCreditsModalOpen: boolean;
    closeInsufficientCreditsModal: () => void;
    upload: (claimId: string, file: File) => Promise<UploadResult | null>;
    deleteUpload: (claimId: string, uploadId: string) => Promise<void>;
}

interface UploadRequestFailure {
    code?: string;
    message: string;
    status: number;
}

interface UploadErrorPayload {
    code?: unknown;
    error?: unknown;
    message?: unknown;
}

const readUploadFailure = async (
    response: Response,
    fallback: string,
): Promise<UploadRequestFailure> => {
    const body =
        ((await response.json().catch(() => null)) as UploadErrorPayload | null) ??
        null;
    const error = typeof body?.error === "string" ? body.error.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    return {
        status: response.status,
        code: code || undefined,
        message: error || message || fallback,
    };
};

const isInsufficientCreditsFailure = (
    failure: UploadRequestFailure,
): boolean =>
    failure.status === 402 || failure.code === "INSUFFICIENT_CREDITS";

export const useClaimEvidenceUpload = (): UseClaimEvidenceUploadResult => {
    const queryClient = useQueryClient();
    const [isTransferring, setIsTransferring] = useState(false);
    const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);
    const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] =
        useState(false);

    const closeInsufficientCreditsModal = useCallback((): void => {
        setIsInsufficientCreditsModalOpen(false);
    }, []);

    const handleUploadFailure = useCallback(
        async (response: Response, fallback: string): Promise<void> => {
            const failure = await readUploadFailure(response, fallback);
            if (isInsufficientCreditsFailure(failure)) {
                setIsInsufficientCreditsModalOpen(true);
                return;
            }
            throw new Error(failure.message);
        },
        [],
    );

    const upload = useCallback(async (
        claimId: string,
        file: File,
    ): Promise<UploadResult | null> => {
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
                await handleUploadFailure(
                    presignRes,
                    "Failed to get upload URL",
                );
                return null;
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
                await handleUploadFailure(
                    finalizeRes,
                    "Failed to confirm upload",
                );
                return null;
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
    }, [handleUploadFailure, queryClient]);

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
                    const failure = await readUploadFailure(
                        deleteRes,
                        "Failed to delete upload",
                    );
                    throw new Error(failure.message);
                }

                void invalidateClaimVerificationQueries(queryClient, claimId);
            } finally {
                setDeletingUploadId(null);
            }
        },
        [queryClient],
    );

    return {
        isTransferring,
        deletingUploadId,
        isInsufficientCreditsModalOpen,
        closeInsufficientCreditsModal,
        upload,
        deleteUpload,
    };
};
