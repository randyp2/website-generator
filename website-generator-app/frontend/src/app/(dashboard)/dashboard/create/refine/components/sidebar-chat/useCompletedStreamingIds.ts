"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "completedStreamingIds";
const EMPTY_COMPLETED_IDS = new Set<string>();
const listeners = new Set<() => void>();
let cachedCompletedIds: Set<string> | null = null;

const readStoredCompletedIds = (): Set<string> => {
    if (typeof window === "undefined") return EMPTY_COMPLETED_IDS;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return EMPTY_COMPLETED_IDS;

        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            return new Set(
                parsed.filter((id): id is string => typeof id === "string"),
            );
        }
    } catch {
        // Ignore invalid persisted streaming state.
    }

    return EMPTY_COMPLETED_IDS;
};

const getSnapshot = (): Set<string> => {
    if (cachedCompletedIds === null) {
        cachedCompletedIds = readStoredCompletedIds();
    }

    return cachedCompletedIds;
};

const getServerSnapshot = (): Set<string> => EMPTY_COMPLETED_IDS;

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const writeCompletedIds = (completedIds: Set<string>) => {
    cachedCompletedIds = completedIds;

    if (typeof window !== "undefined") {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(Array.from(completedIds)),
        );
    }

    listeners.forEach((listener) => listener());
};

export const useCompletedStreamingIds = () => {
    const completedStreamingIds = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    const markStreamingComplete = useCallback((messageId: string) => {
        const current = getSnapshot();
        if (current.has(messageId)) return;

        const next = new Set(current);
        next.add(messageId);
        writeCompletedIds(next);
    }, []);

    return [completedStreamingIds, markStreamingComplete] as const;
};
