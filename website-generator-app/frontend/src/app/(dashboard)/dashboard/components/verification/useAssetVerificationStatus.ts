"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchClaimUploadById, fetchJobStatus } from "./verification.api";
import type { AssetJobPhase } from "./verification.types";

export interface AssetVerificationStatusState {
    phase: AssetJobPhase | null;
    confidence: number | null;
    summary: string | null;
    analysisError: string | null;
}

const POLL_INTERVAL_MS = 1500;

const extractVerificationResult = (
    metadata: Record<string, unknown> | null | undefined,
): { confidence: number | null; summary: string | null } => {
    const av = metadata?.assetVerification;
    if (!av || typeof av !== "object") return { confidence: null, summary: null };
    const record = av as Record<string, unknown>;
    return {
        confidence: typeof record.confidence === "number" ? record.confidence : null,
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
    const [phase, setPhase] = useState<AssetJobPhase | null>(
        jobId ? "QUEUED" : null,
    );
    const [confidence, setConfidence] = useState<number | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const resolvedRef = useRef(false);

    const resolveUploadResult = useCallback(async () => {
        const upload = await fetchClaimUploadById(claimId, uploadId);
        if (!upload) return;
        const { confidence: c, summary: s } = extractVerificationResult(upload.metadata);
        if (c !== null) setConfidence(c);
        if (s !== null) setSummary(s);
        if (upload.analysisError) setAnalysisError(upload.analysisError);
    }, [claimId, uploadId]);

    useEffect(() => {
        resolvedRef.current = false;
        let timeoutId: number | null = null;

        const poll = async () => {
            if (resolvedRef.current) return;

            if (!jobId) {
                await resolveUploadResult();
                return;
            }

            const status = await fetchJobStatus(jobId);

            if (!status) {
                timeoutId = window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
                return;
            }

            setPhase(status.status);

            if (status.status === "COMPLETED" || status.status === "FAILED") {
                resolvedRef.current = true;
                if (status.error) setAnalysisError(status.error);
                await resolveUploadResult();
                return;
            }

            timeoutId = window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
        };

        void poll();

        return () => {
            resolvedRef.current = true;
            if (timeoutId !== null) window.clearTimeout(timeoutId);
        };
    }, [jobId, resolveUploadResult]);

    return { phase, confidence, summary, analysisError };
};
