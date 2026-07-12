"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
    invalidateClaimVerificationQueries,
    useAssetJobStatusQuery,
    useClaimUploadQuery,
} from "./verification.query";
import type { AssetJobPhase } from "./verification.types";

export interface AssetVerificationStatusState {
    phase: AssetJobPhase | null;
    matchConfidence: number | null;
    evidenceDepth: number | null;
    summary: string | null;
    analysisError: string | null;
}

const extractVerificationResult = (
    metadata: Record<string, unknown> | null | undefined,
): { matchConfidence: number | null; evidenceDepth: number | null; summary: string | null } => {
    const av = metadata?.assetVerification;
    if (!av || typeof av !== "object") {
        return { matchConfidence: null, evidenceDepth: null, summary: null };
    }
    const record = av as Record<string, unknown>;
    const legacyConfidence = typeof record.confidence === "number" ? record.confidence : null;
    return {
        matchConfidence: typeof record.matchConfidence === "number"
            ? record.matchConfidence
            : legacyConfidence,
        evidenceDepth: typeof record.evidenceDepth === "number"
            ? record.evidenceDepth
            : legacyConfidence,
        summary: typeof record.summary === "string" && record.summary.trim()
            ? record.summary.trim()
            : null,
    };
};

export const useAssetVerificationStatus = (
    claimId: string,
    uploadId: string,
    jobId: string | null,
): AssetVerificationStatusState => {
    const queryClient = useQueryClient();
    const jobStatusQuery = useAssetJobStatusQuery(jobId);
    const jobStatus = jobStatusQuery.data;
    const phase = jobStatus?.status ?? (jobId ? "QUEUED" : null);
    const isTerminalPhase = phase === "COMPLETED" || phase === "FAILED";
    const uploadQuery = useClaimUploadQuery({
        claimId,
        uploadId,
        enabled: !jobId || isTerminalPhase,
    });
    const upload = uploadQuery.data ?? null;
    const { matchConfidence, evidenceDepth, summary } = extractVerificationResult(upload?.metadata);

    useEffect(() => {
        if (!isTerminalPhase) return;

        void invalidateClaimVerificationQueries(queryClient, claimId);
    }, [claimId, isTerminalPhase, queryClient]);

    return {
        phase,
        matchConfidence,
        evidenceDepth,
        summary,
        analysisError: jobStatus?.error ?? upload?.analysisError ?? null,
    };
};
