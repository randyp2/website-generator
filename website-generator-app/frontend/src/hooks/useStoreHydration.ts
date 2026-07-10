import { useEffect, useState, useSyncExternalStore } from "react";

/** Minimal surface of a zustand store wrapped in the persist middleware. */
interface PersistedStore {
    persist: {
        hasHydrated: () => boolean;
        onFinishHydration: (callback: () => void) => () => void;
    };
}

const HYDRATION_TIMEOUT_MS = 3000;

/**
 * Tracks whether a persisted zustand store has finished rehydrating.
 *
 * Fails open after a timeout: zustand swallows rehydration errors, so a
 * store that never finishes hydrating would otherwise leave every
 * hydration-gated input disabled forever with a clean console. Past the
 * timeout the app proceeds with in-memory defaults, which at worst loses
 * draft state instead of locking the UI.
 */
export const useStoreHydration = (store: PersistedStore): boolean => {
    // SSR snapshot is false so server and first client render agree; the
    // subscription flips it as soon as hydration completes on the client.
    const isHydrated = useSyncExternalStore(
        (onStoreChange) => store.persist.onFinishHydration(onStoreChange),
        () => store.persist.hasHydrated(),
        () => false,
    );

    const [hasTimedOut, setHasTimedOut] = useState(false);

    useEffect(() => {
        if (isHydrated) return;

        const timeout = setTimeout(() => {
            console.error(
                "[useStoreHydration] Hydration timed out; proceeding with in-memory defaults",
            );
            setHasTimedOut(true);
        }, HYDRATION_TIMEOUT_MS);

        return () => clearTimeout(timeout);
    }, [isHydrated, store]);

    return isHydrated || hasTimedOut;
};
