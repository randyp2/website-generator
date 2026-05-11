"use client";

import { useCallback, useState } from "react";
import {
    buildClaimEvidenceUploadDescriptorFromFile,
    validateClaimEvidenceUploadDescriptor,
} from "@/lib/verification/claimEvidenceUploadPolicy";

interface PresignResponse {
    uploadId: string;
    uploadUrl: string;
    requiredHeaders: Record<string, string> | null;
}

interface FinalizeResponse {
    upload?: unknown;
    jobId?: string;
}

interface VerificationJobStatusResponse {
    jobId: string;
    status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
    error?: string;
}

interface UseClaimEvidenceUploadResult {
    isTransferring: boolean;
    deletingUploadId: string | null;
    upload: (claimId: string, file: File) => Promise<void>;
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

const VERIFICATION_POLL_INTERVAL_MS = 1500;
const VERIFICATION_POLL_TIMEOUT_MS = 120_000;

const delay = async (ms: number): Promise<void> =>
    new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });

export const useClaimEvidenceUpload = (): UseClaimEvidenceUploadResult => {
    const [isTransferring, setIsTransferring] = useState(false);
    const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);

    const pollVerificationJobStatus = useCallback(
        async (jobId: string): Promise<void> => {
            const startedAt = Date.now();

            while (Date.now() - startedAt < VERIFICATION_POLL_TIMEOUT_MS) {
                const statusRes = await fetch(
                    `/api/profile/resume-verification/jobs/status/${jobId}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    },
                );

                if (statusRes.status === 404) {
                    await delay(VERIFICATION_POLL_INTERVAL_MS);
                    continue;
                }

                if (!statusRes.ok) {
                    throw new Error(
                        await readErrorMessage(
                            statusRes,
                            "Failed to check verification status",
                        ),
                    );
                }

                const statusPayload =
                    (await statusRes.json()) as VerificationJobStatusResponse;

                if (statusPayload.status === "COMPLETED") {
                    return;
                }

                if (statusPayload.status === "FAILED") {
                    throw new Error(
                        statusPayload.error?.trim() || "Asset verification failed",
                    );
                }

                await delay(VERIFICATION_POLL_INTERVAL_MS);
            }

            throw new Error(
                "Verification is taking longer than expected. Please refresh and check again.",
            );
        },
        [],
    );

    const upload = useCallback(async (claimId: string, file: File): Promise<void> => {
        const descriptor = buildClaimEvidenceUploadDescriptorFromFile(file);
        const validationError = validateClaimEvidenceUploadDescriptor(descriptor);
        if (validationError) {
            throw new Error(validationError);
        }

        setIsTransferring(true);
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
        } finally {
            setIsTransferring(false);
        }

        // Fire-and-forget: AI verification runs in the background after the
        // file transfer lock is released so the user can take other actions.
        if (verificationJobId) {
            void pollVerificationJobStatus(verificationJobId);
        }
    }, [pollVerificationJobStatus]);

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
            } finally {
                setDeletingUploadId(null);
            }
        },
        [],
    );

    return { isTransferring, deletingUploadId, upload, deleteUpload };
};
