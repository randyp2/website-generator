"use client";

import { useCallback } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";

import type { ClaimDTO } from "@/types/claim";
import type { ConnectedAccountDTO } from "@/types/connection";
import type { EvidenceDTO, EvidenceListResponseDTO } from "@/types/evidence";
import type { ParsedResumeData } from "@/types/resume";
import type { VerificationSummaryDTO } from "@/types/verification-summary";

import {
    deleteClaimRequest,
    fetchClaimUploadById,
    fetchJobStatus,
    runConnectionActionRequest,
    runConnectionSyncRequest,
} from "./verification.api";
import type {
    ClaimUpload,
    ConnectionActionType,
    ConnectionProvider,
} from "./verification.types";

const emptyClaimId = "none";
const emptyJobId = "none";
const emptyUploadId = "none";
const ASSET_JOB_POLL_INTERVAL_MS = 1500;

export interface ResumeVerificationRecord {
    id?: unknown;
    updatedAt?: unknown;
    originalFileName?: unknown;
    fileSizeBytes?: unknown;
    parsedJson?: ParsedResumeData | null;
}

export const verificationQueryKeys = {
    all: ["verification"] as const,
    resumeVerification: () =>
        [...verificationQueryKeys.all, "resume-verification"] as const,
    summary: () => [...verificationQueryKeys.all, "summary"] as const,
    claims: () => [...verificationQueryKeys.all, "claims"] as const,
    evidence: () => [...verificationQueryKeys.all, "evidence"] as const,
    connections: () => [...verificationQueryKeys.all, "connections"] as const,
    claimUploadsRoot: () =>
        [...verificationQueryKeys.all, "claim-uploads"] as const,
    claimUploads: (claimId: string) =>
        [...verificationQueryKeys.claimUploadsRoot(), claimId] as const,
    claimUpload: (claimId: string, uploadId: string) =>
        [
            ...verificationQueryKeys.claimUploads(claimId),
            "upload",
            uploadId,
        ] as const,
    assetJobStatus: (jobId: string) =>
        [...verificationQueryKeys.all, "asset-job-status", jobId] as const,
};

const readJson = async <T>(
    response: Response,
    fallbackMessage: string,
): Promise<T> => {
    if (response.ok) {
        return (await response.json()) as T;
    }

    let message = fallbackMessage;
    try {
        const payload = (await response.json()) as {
            error?: unknown;
            message?: unknown;
        };
        if (typeof payload.error === "string") {
            message = payload.error;
        } else if (typeof payload.message === "string") {
            message = payload.message;
        }
    } catch {
        const text = await response.text().catch(() => "");
        if (text.trim()) message = text.trim();
    }

    throw new Error(message);
};

export const fetchVerificationSummary =
    async (): Promise<VerificationSummaryDTO> => {
        const response = await fetch("/api/profile/resume-verification/summary", {
            cache: "no-store",
            credentials: "same-origin",
        });

        return readJson<VerificationSummaryDTO>(
            response,
            "Failed to fetch verification summary",
        );
    };

export const fetchResumeVerificationRecord =
    async (): Promise<ResumeVerificationRecord | null> => {
        const response = await fetch("/api/profile/resume-verification", {
            cache: "no-store",
            credentials: "same-origin",
        });

        if (response.status === 404) return null;

        const data = await readJson<unknown>(
            response,
            "Failed to load existing resume verification",
        );
        if (!data || typeof data !== "object") return null;

        return data as ResumeVerificationRecord;
    };

export const fetchVerificationClaims = async (): Promise<ClaimDTO[]> => {
    const response = await fetch("/api/profile/resume-verification/claims", {
        cache: "no-store",
        credentials: "same-origin",
    });

    return readJson<ClaimDTO[]>(response, "Failed to fetch claims");
};

export const fetchVerificationEvidence = async (): Promise<EvidenceDTO[]> => {
    const response = await fetch("/api/profile/resume-verification/evidence", {
        cache: "no-store",
        credentials: "same-origin",
    });

    const data = await readJson<EvidenceListResponseDTO>(
        response,
        "Failed to fetch evidence",
    );
    return Array.isArray(data.items) ? data.items : [];
};

export const fetchVerificationConnections = async (): Promise<
    ConnectedAccountDTO[]
> => {
    const response = await fetch(
        "/api/profile/resume-verification/connections",
        {
            cache: "no-store",
            credentials: "same-origin",
        },
    );

    return readJson<ConnectedAccountDTO[]>(
        response,
        "Failed to fetch connections",
    );
};

export const fetchClaimUploads = async (
    claimId: string,
): Promise<ClaimUpload[]> => {
    const response = await fetch(
        `/api/profile/resume-verification/claims/${claimId}/evidence-uploads`,
        {
            cache: "no-store",
            credentials: "same-origin",
        },
    );

    const data = await readJson<{ items?: ClaimUpload[] }>(
        response,
        "Failed to fetch claim uploads",
    );
    return Array.isArray(data.items) ? data.items : [];
};

export const invalidateVerificationQueries = async (
    queryClient: QueryClient,
): Promise<void> => {
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.summary(),
        }),
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.claims(),
        }),
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.evidence(),
        }),
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.connections(),
        }),
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.claimUploadsRoot(),
        }),
    ]);
};

export const invalidateClaimVerificationQueries = async (
    queryClient: QueryClient,
    claimId: string,
): Promise<void> => {
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.summary(),
        }),
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.claims(),
        }),
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.evidence(),
        }),
        queryClient.invalidateQueries({
            queryKey: verificationQueryKeys.claimUploads(claimId),
        }),
    ]);
};

export const useInvalidateVerificationQueries = () => {
    const queryClient = useQueryClient();

    return useCallback(
        () => invalidateVerificationQueries(queryClient),
        [queryClient],
    );
};

export const useVerificationSummaryQuery = () =>
    useQuery({
        queryKey: verificationQueryKeys.summary(),
        queryFn: fetchVerificationSummary,
        staleTime: 0,
    });

export const useResumeVerificationRecordQuery = () =>
    useQuery({
        queryKey: verificationQueryKeys.resumeVerification(),
        queryFn: fetchResumeVerificationRecord,
        staleTime: 0,
    });

export const useVerificationClaimsQuery = () =>
    useQuery({
        queryKey: verificationQueryKeys.claims(),
        queryFn: fetchVerificationClaims,
        staleTime: 0,
    });

export const useVerificationEvidenceQuery = () =>
    useQuery({
        queryKey: verificationQueryKeys.evidence(),
        queryFn: fetchVerificationEvidence,
        staleTime: 0,
    });

export const useVerificationConnectionsQuery = () =>
    useQuery({
        queryKey: verificationQueryKeys.connections(),
        queryFn: fetchVerificationConnections,
        staleTime: 0,
    });

export const useClaimUploadsQuery = (claimId: string | null) =>
    useQuery({
        queryKey: verificationQueryKeys.claimUploads(claimId ?? emptyClaimId),
        queryFn: () => fetchClaimUploads(claimId ?? emptyClaimId),
        enabled: Boolean(claimId),
        staleTime: 0,
    });

export const useAssetJobStatusQuery = (jobId: string | null) =>
    useQuery({
        queryKey: verificationQueryKeys.assetJobStatus(jobId ?? emptyJobId),
        queryFn: () => (jobId ? fetchJobStatus(jobId) : null),
        enabled: Boolean(jobId),
        staleTime: 0,
        refetchInterval: (query) => {
            const status = query.state.data;
            if (!status) return ASSET_JOB_POLL_INTERVAL_MS;
            return status.status === "COMPLETED" || status.status === "FAILED"
                ? false
                : ASSET_JOB_POLL_INTERVAL_MS;
        },
    });

export const useClaimUploadQuery = ({
    claimId,
    enabled,
    uploadId,
}: {
    claimId: string;
    enabled: boolean;
    uploadId: string;
}) =>
    useQuery({
        queryKey: verificationQueryKeys.claimUpload(
            claimId || emptyClaimId,
            uploadId || emptyUploadId,
        ),
        queryFn: () => fetchClaimUploadById(claimId, uploadId),
        enabled: enabled && Boolean(claimId) && Boolean(uploadId),
        staleTime: 0,
    });

export const useConnectionActionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            action,
            provider,
        }: {
            action: ConnectionActionType;
            provider: ConnectionProvider;
        }) => runConnectionActionRequest(provider, action),
        onSuccess: async (_result, variables) => {
            if (variables.action !== "disconnect") return;

            await queryClient.invalidateQueries({
                queryKey: verificationQueryKeys.connections(),
            });
        },
    });
};

export const useRunConnectionSyncMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (provider: ConnectionProvider) =>
            runConnectionSyncRequest(provider),
        onSuccess: async () => {
            await invalidateVerificationQueries(queryClient);
        },
    });
};

export const useDeleteClaimMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteClaimRequest,
        onSuccess: async () => {
            await invalidateVerificationQueries(queryClient);
        },
    });
};
