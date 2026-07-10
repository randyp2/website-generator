import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Which pipeline produced the job. */
export type GenerationJobKind = "generate" | "refine";

/** A backend generation job the frontend is tracking. */
export interface ActiveGenerationJob {
    jobId: string;
    portfolioId: string;
    kind: GenerationJobKind;
    startedAt: number;
}

interface GenerationJobState {
    activeJob: ActiveGenerationJob | null;
    startJob: (job: Omit<ActiveGenerationJob, "startedAt">) => void;
    clearJob: () => void;
}

const STORE_KEY = "generation-job-store";

/**
 * Tracks the currently running generation/refine job.
 *
 * Persisted to localStorage (unlike the sessionStorage portfolio store) so
 * every tab on the origin can see that a job is running: the backend keeps
 * working after the originating tab navigates away or closes, and a global
 * watcher can resume polling and notify from any tab.
 */
export const useGenerationJobStore = create<GenerationJobState>()(
    persist(
        (set) => ({
            activeJob: null,
            startJob: (job) =>
                set({ activeJob: { ...job, startedAt: Date.now() } }),
            clearJob: () => set({ activeJob: null }),
        }),
        {
            name: STORE_KEY,
            storage: createJSONStorage(() => localStorage),
            // Corrupt persisted state would silently disable job tracking:
            // recover by dropping the bad entry and rehydrating with defaults.
            // Deferred because the first hydrate runs synchronously during
            // store creation, before the store const is initialized.
            onRehydrateStorage: () => (_state, error) => {
                if (!error) return;
                console.error(
                    "[generation-job-store] Failed to rehydrate persisted state; clearing it and retrying with defaults",
                    error,
                );
                localStorage.removeItem(STORE_KEY);
                setTimeout(() => {
                    void useGenerationJobStore.persist.rehydrate();
                }, 0);
            },
        },
    ),
);

/**
 * Keeps this tab's job state in sync with writes from other tabs.
 *
 * zustand's persist middleware only reads storage on load, so without this a
 * tab never notices when another tab starts or clears a job. Call once from a
 * long-lived client component (the job watcher); returns a cleanup function.
 */
export const syncGenerationJobAcrossTabs = (): (() => void) => {
    const onStorage = (event: StorageEvent): void => {
        if (event.key === STORE_KEY) {
            void useGenerationJobStore.persist.rehydrate();
        }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
};
