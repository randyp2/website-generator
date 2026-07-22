"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { JobStatusResponse } from "@/types/portfolio";
import { useToastStore } from "@/hooks/useToast";
import {
    GenerationPollingGuard,
    type GenerationPollingStopReason,
} from "@/lib/generation-polling";
import {
    useGenerationJobStore,
    syncGenerationJobAcrossTabs,
    type ActiveGenerationJob,
} from "@/stores/useGenerationJobStore";

const WATCH_INTERVAL_MS = 4000;
const REFINE_PATH = "/dashboard/create/refine";

const JOB_MESSAGES = {
    generate: {
        done: {
            title: "Your portfolio is ready!",
            description: "Generation finished. Open the editor to view it.",
        },
        failed: {
            title: "Portfolio generation failed",
            description: "Something went wrong. Open the editor to try again.",
        },
    },
    refine: {
        done: {
            title: "Your changes are ready!",
            description: "The refinement finished. Open the editor to view it.",
        },
        failed: {
            title: "Refinement failed",
            description: "Your changes could not be applied. Open the editor to try again.",
        },
    },
} as const;

/* Fires a browser notification when the page is hidden, so a backgrounded
 * tab still reaches the user. Clicking it brings them back to the editor. */
const notifyBrowser = (title: string, description: string): void => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (document.visibilityState !== "hidden") return;

    const notification = new Notification(title, { body: description });
    notification.onclick = () => {
        window.focus();
        window.location.href = REFINE_PATH;
    };
};

const notifyJobFinished = (job: ActiveGenerationJob, failed: boolean): void => {
    const message = JOB_MESSAGES[job.kind][failed ? "failed" : "done"];
    useToastStore.getState().addToast({
        type: failed ? "error" : "success",
        title: message.title,
        description: message.description,
    });
    notifyBrowser(message.title, message.description);
};

const TRACKING_FAILURE_MESSAGES: Record<GenerationPollingStopReason, string> = {
    TIMEOUT: "Tracking timed out. Open the editor to check the portfolio before trying again.",
    AUTHORIZATION: "Your session expired while tracking generation. Sign in again to check it.",
    MISSING: "The generation status expired before completion was confirmed. Open the editor to check it.",
    UNAVAILABLE: "The generation service could not be reached. Open the editor to check the portfolio.",
};

const notifyTrackingStopped = (
    job: ActiveGenerationJob,
    reason: GenerationPollingStopReason,
): void => {
    const title = job.kind === "generate"
        ? "Could not confirm portfolio generation"
        : "Could not confirm refinement";
    const description = TRACKING_FAILURE_MESSAGES[reason];
    useToastStore.getState().addToast({
        type: "error",
        title,
        description,
    });
    notifyBrowser(title, description);
};

/**
 * Invisible dashboard-wide watcher for the active generation job.
 *
 * The refine page owns polling and notifications while the user is on it;
 * this component covers everywhere else, so the user can browse the rest of
 * the app during generation and still learn when the job finishes. Renders
 * nothing.
 */
export const GenerationJobWatcher = (): null => {
    const activeJob = useGenerationJobStore((state) => state.activeJob);
    const pathname = usePathname();
    const onRefinePage = pathname?.startsWith(REFINE_PATH) ?? false;

    // Pick up jobs started or cleared by other tabs
    useEffect(() => syncGenerationJobAcrossTabs(), []);

    // Ask for notification permission when a job starts, a moment the user
    // understands why. Never prompt on plain page load.
    useEffect(() => {
        if (!activeJob) return;
        if (typeof Notification === "undefined") return;
        if (Notification.permission === "default") {
            void Notification.requestPermission();
        }
    }, [activeJob]);

    useEffect(() => {
        if (!activeJob || onRefinePage) return;

        let finished = false;
        let pollInFlight = false;
        const guard = new GenerationPollingGuard(activeJob.startedAt);

        const stopTracking = (reason: GenerationPollingStopReason): void => {
            finished = true;
            useGenerationJobStore.getState().clearJob();
            notifyTrackingStopped(activeJob, reason);
        };

        const poll = async (): Promise<void> => {
            if (finished || pollInFlight) return;

            const deadlineReason = guard.stopReason();
            if (deadlineReason) {
                stopTracking(deadlineReason);
                return;
            }

            pollInFlight = true;
            try {
                const res = await fetch(
                    `/api/portfolio/jobs/status/${activeJob.jobId}`,
                    { cache: "no-store" },
                );
                const responseReason = guard.recordResponse(res.status);
                if (responseReason) {
                    stopTracking(responseReason);
                    return;
                }
                if (!res.ok) return;

                const status = ((await res.json()) as JobStatusResponse).status;
                if (status !== "COMPLETED" && status !== "FAILED") return;

                finished = true;
                useGenerationJobStore.getState().clearJob();
                notifyJobFinished(activeJob, status === "FAILED");
            } catch {
                const failureReason = guard.recordNetworkFailure();
                if (failureReason) stopTracking(failureReason);
            } finally {
                pollInFlight = false;
            }
        };

        const timer = setInterval(() => {
            void poll();
        }, WATCH_INTERVAL_MS);
        void poll();

        return () => clearInterval(timer);
    }, [activeJob, onRefinePage]);

    return null;
};

export default GenerationJobWatcher;
