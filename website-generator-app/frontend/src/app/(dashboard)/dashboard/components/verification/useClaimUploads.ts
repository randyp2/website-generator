"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClaimUpload } from "./verification.types";

export type { ClaimUpload };

interface UseClaimUploadsResult {
    uploads: ClaimUpload[];
    isLoading: boolean;
    refetch: () => Promise<void>;
    removeUpload: (uploadId: string) => void;
    restoreUpload: (upload: ClaimUpload) => void;
}

export const useClaimUploads = (claimId: string | null): UseClaimUploadsResult => {
    const [uploads, setUploads] = useState<ClaimUpload[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const load = useCallback(async () => {
        if (!claimId) {
            setUploads([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/profile/resume-verification/claims/${claimId}/evidence-uploads`,
            );
            if (!res.ok) return;
            const data = (await res.json()) as { items: ClaimUpload[] };
            setUploads(data.items ?? []);
        } finally {
            setIsLoading(false);
        }
    }, [claimId]);

    useEffect(() => {
        void load();
    }, [load]);

    const removeUpload = useCallback((uploadId: string) => {
        setUploads((current) => current.filter((upload) => upload.id !== uploadId));
    }, []);

    const restoreUpload = useCallback((upload: ClaimUpload) => {
        setUploads((current) => {
            if (current.some((item) => item.id === upload.id)) {
                return current;
            }

            return [upload, ...current];
        });
    }, []);

    return { uploads, isLoading, refetch: load, removeUpload, restoreUpload };
};
