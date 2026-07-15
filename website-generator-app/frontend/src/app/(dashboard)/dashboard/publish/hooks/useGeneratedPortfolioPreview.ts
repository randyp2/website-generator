"use client";

import { useEffect, useRef, useState } from "react";

export type GeneratedPreviewState =
    | "idle"
    | "requesting"
    | "processing"
    | "ready"
    | "error";

interface GeneratedPreviewResponse {
    versionId: string;
    status: "QUEUED" | "PENDING" | "READY";
    previewUrl: string | null;
}

interface UseGeneratedPortfolioPreviewResult {
    previewUrl: string | null;
    state: GeneratedPreviewState;
    error: string | null;
}

const POLL_INTERVAL_MS = 1_500;

const readError = async (response: Response): Promise<string> => {
    const payload: unknown = await response.json().catch(() => null);
    if (payload && typeof payload === "object") {
        const errorPayload = payload as Record<string, unknown>;
        for (const key of ["error", "message", "detail"] as const) {
            const value = errorPayload[key];
            if (typeof value === "string" && value.trim()) return value;
        }
    }
    return "Unable to generate the portfolio preview.";
};

/** Requests and follows the active generated version's background screenshot. */
export const useGeneratedPortfolioPreview = (
    portfolioId: string | null,
    enabled: boolean,
): UseGeneratedPortfolioPreviewResult => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [state, setState] = useState<GeneratedPreviewState>("idle");
    const [error, setError] = useState<string | null>(null);
    const requestedPortfolioIds = useRef(new Set<string>());

    useEffect(() => {
        if (!portfolioId || !enabled) return;

        let cancelled = false;
        let pollTimer: ReturnType<typeof setTimeout> | null = null;

        const fetchStatus = async (method: "GET" | "POST") => {
            const response = await fetch(
                `/api/portfolio/${portfolioId}/preview-screenshot`,
                { method },
            );
            if (!response.ok) throw new Error(await readError(response));
            return (await response.json()) as GeneratedPreviewResponse;
        };

        const poll = async (): Promise<void> => {
            try {
                const shouldRequest = !requestedPortfolioIds.current.has(portfolioId);
                if (shouldRequest) {
                    requestedPortfolioIds.current.add(portfolioId);
                    setPreviewUrl(null);
                    setError(null);
                    setState("requesting");
                } else {
                    setState("processing");
                }

                const result = await fetchStatus(shouldRequest ? "POST" : "GET");
                if (cancelled) return;
                if (result.status === "READY" && result.previewUrl) {
                    setPreviewUrl(result.previewUrl);
                    setState("ready");
                    return;
                }

                setState("processing");
                pollTimer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
            } catch (cause) {
                if (cancelled) return;
                requestedPortfolioIds.current.delete(portfolioId);
                setError(
                    cause instanceof Error
                        ? cause.message
                        : "Unable to generate the portfolio preview.",
                );
                setState("error");
            }
        };

        void poll();
        return () => {
            cancelled = true;
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [enabled, portfolioId]);

    return { previewUrl, state, error };
};
