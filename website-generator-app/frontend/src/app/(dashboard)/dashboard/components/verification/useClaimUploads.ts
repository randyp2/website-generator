"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
    useClaimUploadsQuery,
    verificationQueryKeys,
} from "./verification.query";
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
    const queryClient = useQueryClient();
    const {
        data,
        isFetching,
        refetch: refetchUploads,
    } = useClaimUploadsQuery(claimId);
    const refetch = useCallback(async () => {
        await refetchUploads();
    }, [refetchUploads]);

    const removeUpload = useCallback((uploadId: string) => {
        if (!claimId) return;

        queryClient.setQueryData<ClaimUpload[]>(
            verificationQueryKeys.claimUploads(claimId),
            (current) =>
                (current ?? []).filter((upload) => upload.id !== uploadId),
        );
    }, [claimId, queryClient]);

    const restoreUpload = useCallback((upload: ClaimUpload) => {
        if (!claimId) return;

        queryClient.setQueryData<ClaimUpload[]>(
            verificationQueryKeys.claimUploads(claimId),
            (current) => {
                const uploads = current ?? [];
                if (uploads.some((item) => item.id === upload.id)) {
                    return uploads;
                }

                return [upload, ...uploads];
            },
        );
    }, [claimId, queryClient]);

    return {
        uploads: data ?? [],
        isLoading: isFetching,
        refetch,
        removeUpload,
        restoreUpload,
    };
};
