"use client";

import { useCallback, useEffect, useState } from "react";

export interface ClaimUpload {
    id: string;
    originalFileName: string;
    status: string;
    analysisError?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
}

interface UseClaimUploadsResult {
    uploads: ClaimUpload[];
    isLoading: boolean;
    refetch: () => Promise<void>;
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

    return { uploads, isLoading, refetch: load };
};
