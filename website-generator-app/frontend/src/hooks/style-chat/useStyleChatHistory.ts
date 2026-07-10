import {
    useEffect,
    useMemo,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";

import { useStoreHydration } from "@/hooks/useStoreHydration";
import { isStyleChatHistory, toUiStyleMessages } from "@/lib/style-chat-history";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { Message } from "@/types/preview";
import type {
    InitialStyleChatHistoryState,
    PersistedStyleChatMessage,
} from "@/types/style-chat";

import {
    normalizeInitialStyleChatHistory,
    toInitialStyleMessages,
} from "./style-chat-utils";

type MutableRef<T> = {
    current: T;
};

interface UseStyleChatHistoryParams {
    activePortfolioId: string | null;
    createdDraftIdRef: MutableRef<string | null>;
    initialStyleChatHistory?: InitialStyleChatHistoryState | null;
    lastSyncedHistoryRef: MutableRef<string>;
}

interface UseStyleChatHistoryResult {
    hasLoadedHistory: boolean;
    isHydrated: boolean;
    isLoadingHistory: boolean;
    isReadyForInteraction: boolean;
    normalizedStyleMessages: Message[];
    setStyleMessages: Dispatch<SetStateAction<Message[]>>;
    styleMessages: Message[];
}

/**
 * Loads, normalizes, and mirrors style chat messages for the style step.
 */
export const useStyleChatHistory = ({
    activePortfolioId,
    createdDraftIdRef,
    initialStyleChatHistory,
    lastSyncedHistoryRef,
}: UseStyleChatHistoryParams): UseStyleChatHistoryResult => {
    const setPersistedStyleMessages = usePortfolioStore(
        (state) => state.setStyleMessages,
    );
    const isHydrated = useStoreHydration(usePortfolioStore);
    const [styleMessages, setStyleMessages] = useState<Message[]>(() =>
        toInitialStyleMessages(null),
    );
    const [hasLoadedHistory, setHasLoadedHistory] = useState(!activePortfolioId);

    useEffect(() => {
        let cancelled = false;

        const applyLoadedHistory = (
            history: PersistedStyleChatMessage[] | null | undefined,
        ) => {
            if (cancelled) return;

            if (isStyleChatHistory(history) && history.length > 0) {
                lastSyncedHistoryRef.current = JSON.stringify(history);
            } else {
                lastSyncedHistoryRef.current = "";
            }

            setStyleMessages(toInitialStyleMessages(history));
            setHasLoadedHistory(true);
        };

        const loadHistory = async () => {
            if (!activePortfolioId) {
                applyLoadedHistory(null);
                return;
            }

            if (createdDraftIdRef.current === activePortfolioId) {
                setHasLoadedHistory(true);
                return;
            }

            setHasLoadedHistory(false);
            lastSyncedHistoryRef.current = "";

            const initial =
                normalizeInitialStyleChatHistory(initialStyleChatHistory);
            if (initial.isResolved) {
                applyLoadedHistory(initial.history);
                return;
            }

            try {
                const response = await fetch(`/api/portfolio/${activePortfolioId}/get`);
                const data = response.ok ? await response.json() : null;
                const rawHistory = data?.portfolio?.style_chat_history;

                if (cancelled) return;

                if (isStyleChatHistory(rawHistory) && rawHistory.length > 0) {
                    lastSyncedHistoryRef.current = JSON.stringify(rawHistory);
                    setStyleMessages(toUiStyleMessages(rawHistory));
                } else {
                    applyLoadedHistory(null);
                }
            } catch {
                if (cancelled) return;
                applyLoadedHistory(null);
            } finally {
                if (!cancelled) {
                    setHasLoadedHistory(true);
                }
            }
        };

        void loadHistory();

        return () => {
            cancelled = true;
        };
    }, [
        activePortfolioId,
        createdDraftIdRef,
        initialStyleChatHistory,
        lastSyncedHistoryRef,
    ]);

    useEffect(() => {
        if (!isHydrated || !hasLoadedHistory) return;
        setPersistedStyleMessages(styleMessages);
    }, [
        hasLoadedHistory,
        isHydrated,
        setPersistedStyleMessages,
        styleMessages,
    ]);

    const normalizedStyleMessages = useMemo(
        () =>
            styleMessages.map((message) => ({
                ...message,
                timestamp:
                    message.timestamp instanceof Date
                        ? message.timestamp
                        : new Date(message.timestamp),
            })),
        [styleMessages],
    );

    return {
        hasLoadedHistory,
        isHydrated,
        isLoadingHistory: !hasLoadedHistory,
        isReadyForInteraction: isHydrated && hasLoadedHistory,
        normalizedStyleMessages,
        setStyleMessages,
        styleMessages,
    };
};
