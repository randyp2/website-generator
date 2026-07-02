import { useCallback, useEffect, useRef } from "react";

import { toPersistedStyleChatHistory } from "@/lib/style-chat-history";
import type { Message } from "@/types/preview";
import type { PersistedStyleChatMessage } from "@/types/style-chat";

import { STYLE_CHAT_SYNC_DEBOUNCE_MS } from "./style-chat-utils";

type MutableRef<T> = {
    current: T;
};

interface UseStyleChatPersistenceParams {
    activePortfolioId: string | null;
    hasLoadedHistory: boolean;
    isHydrated: boolean;
    lastSyncedHistoryRef: MutableRef<string>;
    styleMessages: Message[];
}

/**
 * Persists style chat history after initial history has loaded.
 */
export const useStyleChatPersistence = ({
    activePortfolioId,
    hasLoadedHistory,
    isHydrated,
    lastSyncedHistoryRef,
    styleMessages,
}: UseStyleChatPersistenceParams) => {
    const styleSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const syncStyleHistoryToDb = useCallback(
        async (serializedHistory: string) => {
            if (!activePortfolioId) return;

            const parsedHistory = JSON.parse(
                serializedHistory,
            ) as PersistedStyleChatMessage[];

            const response = await fetch(`/api/portfolio/${activePortfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    style_chat_history: parsedHistory,
                }),
            }).catch(() => null);

            if (response?.ok) {
                lastSyncedHistoryRef.current = serializedHistory;
            }
        },
        [activePortfolioId, lastSyncedHistoryRef],
    );

    const flushStyleHistorySync = useCallback(async () => {
        if (!isHydrated || !activePortfolioId || !hasLoadedHistory) return;

        if (styleSyncTimeoutRef.current) {
            clearTimeout(styleSyncTimeoutRef.current);
            styleSyncTimeoutRef.current = null;
        }

        const serializedHistory = JSON.stringify(
            toPersistedStyleChatHistory(styleMessages),
        );
        if (serializedHistory === lastSyncedHistoryRef.current) {
            return;
        }

        await syncStyleHistoryToDb(serializedHistory);
    }, [
        activePortfolioId,
        hasLoadedHistory,
        isHydrated,
        lastSyncedHistoryRef,
        styleMessages,
        syncStyleHistoryToDb,
    ]);

    useEffect(() => {
        if (!isHydrated || !activePortfolioId || !hasLoadedHistory) return;

        const serializedHistory = JSON.stringify(
            toPersistedStyleChatHistory(styleMessages),
        );
        if (serializedHistory === lastSyncedHistoryRef.current) {
            return;
        }

        if (styleSyncTimeoutRef.current) {
            clearTimeout(styleSyncTimeoutRef.current);
        }

        styleSyncTimeoutRef.current = setTimeout(() => {
            void syncStyleHistoryToDb(serializedHistory);
            styleSyncTimeoutRef.current = null;
        }, STYLE_CHAT_SYNC_DEBOUNCE_MS);

        return () => {
            if (styleSyncTimeoutRef.current) {
                clearTimeout(styleSyncTimeoutRef.current);
                styleSyncTimeoutRef.current = null;
            }
        };
    }, [
        activePortfolioId,
        hasLoadedHistory,
        isHydrated,
        lastSyncedHistoryRef,
        styleMessages,
        syncStyleHistoryToDb,
    ]);

    return { flushStyleHistorySync };
};
