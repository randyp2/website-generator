"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { JobStatusResponse } from "@/types/portfolio";
import { useToastStore } from "@/hooks/useToast";
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

        // --- Poll the job status until it reaches a terminal state
        const poll = async (): Promise<void> => {
            if (finished) return;

            const res = await fetch(
                `/api/portfolio/jobs/status/${activeJob.jobId}`,
            );

            // Job unknown to the backend (Redis TTL expiry): drop it silently
            if (res.status === 404 || res.status === 410) {
                finished = true;
                useGenerationJobStore.getState().clearJob();
                return;
            }
            if (!res.ok) return;

            const status = ((await res.json()) as JobStatusResponse).status;
            if (status !== "COMPLETED" && status !== "FAILED") return;

            finished = true;
            useGenerationJobStore.getState().clearJob();
            notifyJobFinished(activeJob, status === "FAILED");
        };

        const timer = setInterval(() => {
            void poll().catch(() => {
                // Transient network failure: keep polling
            });
        }, WATCH_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [activeJob, onRefinePage]);

    return null;
};

export default GenerationJobWatcher;
