"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PreviewScreenshotState =
    | "idle"
    | "requesting"
    | "processing"
    | "ready"
    | "error";

type CaptureStatus =
    | "NOT_REQUESTED"
    | "QUEUED"
    | "PENDING"
    | "CAPTURING"
    | "READY"
    | "FAILED";

interface CaptureResponse {
    status: CaptureStatus;
    previewUrl: string | null;
}

export interface PreviewScreenshotResult {
    previewUrl: string | null;
    state: PreviewScreenshotState;
    error: string | null;
    retry: () => void;
}

const POLL_INTERVAL_MS = 1_500;
const CAPTURE_STATUSES = new Set<CaptureStatus>([
    "NOT_REQUESTED",
    "QUEUED",
    "PENDING",
    "CAPTURING",
    "READY",
    "FAILED",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readError = async (response: Response, fallback: string): Promise<string> => {
    const payload: unknown = await response.json().catch(() => null);
    if (isRecord(payload)) {
        for (const key of ["error", "message", "detail"] as const) {
            const value = payload[key];
            if (typeof value === "string" && value.trim()) return value;
        }
    }
    return fallback;
};

const parseCaptureResponse = (value: unknown): CaptureResponse => {
    if (!isRecord(value) || typeof value.status !== "string") {
        throw new Error("Invalid screenshot response");
    }
    const status = value.status as CaptureStatus;
    if (!CAPTURE_STATUSES.has(status)) {
        throw new Error("Invalid screenshot response");
    }
    if (value.previewUrl !== null && typeof value.previewUrl !== "string") {
        throw new Error("Invalid screenshot response");
    }
    return { status, previewUrl: value.previewUrl };
};

/** Requests and follows one asynchronous screenshot endpoint. */
export const usePreviewScreenshot = (
    requestKey: string | null,
    endpoint: string | null,
    enabled: boolean,
    fallbackError: string,
): PreviewScreenshotResult => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [state, setState] = useState<PreviewScreenshotState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const requestedKeys = useRef(new Set<string>());

    const retry = useCallback(() => {
        if (requestKey) requestedKeys.current.delete(requestKey);
        setAttempt((current) => current + 1);
    }, [requestKey]);

    useEffect(() => {
        if (!requestKey || !endpoint || !enabled) return;

        let cancelled = false;
        let pollTimer: ReturnType<typeof setTimeout> | null = null;

        const fetchStatus = async (method: "GET" | "POST") => {
            const response = await fetch(endpoint, { method });
            if (!response.ok) throw new Error(await readError(response, fallbackError));
            return parseCaptureResponse(await response.json());
        };

        const poll = async (): Promise<void> => {
            try {
                const shouldRequest = !requestedKeys.current.has(requestKey);
                if (shouldRequest) {
                    requestedKeys.current.add(requestKey);
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
                if (result.status === "FAILED") {
                    setError(fallbackError);
                    setState("error");
                    return;
                }
                if (result.status === "NOT_REQUESTED") {
                    requestedKeys.current.delete(requestKey);
                }

                setState("processing");
                pollTimer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
            } catch (cause) {
                if (cancelled) return;
                requestedKeys.current.delete(requestKey);
                setError(cause instanceof Error ? cause.message : fallbackError);
                setState("error");
            }
        };

        void poll();
        return () => {
            cancelled = true;
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [attempt, enabled, endpoint, fallbackError, requestKey]);

    return { previewUrl, state, error, retry };
};
