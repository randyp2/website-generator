"use client";

import { useCallback, useState } from "react";

interface PresignResponse {
    uploadId: string;
    uploadUrl: string;
    requiredHeaders: Record<string, string> | null;
}

interface UseClaimEvidenceUploadResult {
    isUploading: boolean;
    upload: (claimId: string, file: File) => Promise<void>;
}

export const useClaimEvidenceUpload = (): UseClaimEvidenceUploadResult => {
    const [isUploading, setIsUploading] = useState(false);

    const upload = useCallback(async (claimId: string, file: File): Promise<void> => {
        setIsUploading(true);
        try {
            const presignRes = await fetch(
                `/api/profile/resume-verification/claims/${claimId}/evidence-uploads/presign`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        originalFileName: file.name,
                        contentType: file.type,
                        fileSizeBytes: file.size,
                    }),
                },
            );

            if (!presignRes.ok) {
                throw new Error("Failed to get upload URL");
            }

            const { uploadId, uploadUrl, requiredHeaders } =
                (await presignRes.json()) as PresignResponse;

            const r2Res = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
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
                throw new Error("Failed to confirm upload");
            }
        } finally {
            setIsUploading(false);
        }
    }, []);

    return { isUploading, upload };
};
