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

interface UseClaimEvidenceUploadResult {
    isUploading: boolean;
    upload: (claimId: string, file: File) => Promise<void>;
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
    const [isUploading, setIsUploading] = useState(false);

    const upload = useCallback(async (claimId: string, file: File): Promise<void> => {
        const descriptor = buildClaimEvidenceUploadDescriptorFromFile(file);
        const validationError = validateClaimEvidenceUploadDescriptor(descriptor);
        if (validationError) {
            throw new Error(validationError);
        }

        setIsUploading(true);
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
        } finally {
            setIsUploading(false);
        }
    }, []);

    return { isUploading, upload };
};
