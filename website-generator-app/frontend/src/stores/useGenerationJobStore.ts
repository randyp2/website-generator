import { create } from "zustand";
import {
    persist,
    createJSONStorage,
    type StateStorage,
} from "zustand/middleware";

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
    startJob: (
        job: Omit<ActiveGenerationJob, "startedAt"> & {
            startedAt?: ActiveGenerationJob["startedAt"];
        },
    ) => void;
    clearJob: () => void;
}

const STORE_KEY = "generation-job-store";

/** One-shot guard so a persistent rehydration failure never retry-loops. */
let hasAttemptedJobStoreRecovery = false;

/**
 * No-op storage used on the server, where real Web Storage is unavailable.
 *
 * We must key the guard off `window`, not `typeof localStorage`: recent Node
 * runtimes inject a global `localStorage` (via `--localstorage-file`) that is
 * present but non-functional, so a `typeof localStorage` check would still
 * hand persist a broken store whose `getItem` throws.
 */
const noopStorage: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
};

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
                set({
                    activeJob: {
                        ...job,
                        startedAt: job.startedAt ?? Date.now(),
                    },
                }),
            clearJob: () => set({ activeJob: null }),
        }),
        {
            name: STORE_KEY,
            storage: createJSONStorage(() =>
                typeof window !== "undefined"
                    ? window.localStorage
                    : noopStorage,
            ),
            // Note: we deliberately do NOT set skipHydration. Several callers
            // read this store synchronously at mount (return to an in-flight
            // job, re-attach to a running generation to avoid paying twice), so
            // it must be hydrated by first render on the client. SSR is covered
            // by noopStorage above; the one component that renders from this
            // store during SSR (the sidebar "busy" dot) gates on
            // useStoreHydration to avoid a hydration mismatch.
            // Jobs are short-lived: discard any older schema instead of
            // loading a stale shape. Bump `version` when ActiveGenerationJob
            // changes shape.
            version: 1,
            migrate: (persistedState, version) =>
                version === 1 ? persistedState : undefined,
            // Corrupt persisted state would silently disable job tracking:
            // recover ONCE by dropping the bad entry and rehydrating with
            // defaults; a second failure would loop. The initial hydrate runs
            // synchronously at store creation; on the server it hits
            // noopStorage (never errors), so this recovery path only executes
            // client-side where window.localStorage is present.
            onRehydrateStorage: () => (_state, error) => {
                if (!error) return;
                console.error(
                    "[generation-job-store] Failed to rehydrate persisted state",
                    error,
                );
                if (hasAttemptedJobStoreRecovery) return;
                hasAttemptedJobStoreRecovery = true;
                window.localStorage.removeItem(STORE_KEY);
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
