import {
    useEffect,
    useMemo,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";

import { isStyleChatHistory, toUiStyleMessages } from "@/lib/style-chat-history";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { Message } from "@/types/preview";
import type {
    InitialStyleChatHistoryState,
    PersistedStyleChatMessage,
} from "@/types/style-chat";

import { toInitialStyleMessages } from "./style-chat-utils";

type MutableRef<T> = {
    current: T;
};

interface UseStyleChatHistoryParams {
    activePortfolioId: string | null;
    createdDraftIdRef: MutableRef<string | null>;
    initialStyleChatHistoryPromise?: Promise<InitialStyleChatHistoryState>;
    lastSyncedHistoryRef: MutableRef<string>;
    onHistoryReset: () => void;
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
    initialStyleChatHistoryPromise,
    lastSyncedHistoryRef,
    onHistoryReset,
}: UseStyleChatHistoryParams): UseStyleChatHistoryResult => {
    const setPersistedStyleMessages = usePortfolioStore(
        (state) => state.setStyleMessages,
    );
    const [isHydrated, setIsHydrated] = useState(false);
    const [styleMessages, setStyleMessages] = useState<Message[]>(() =>
        toInitialStyleMessages(null),
    );
    const [hasLoadedHistory, setHasLoadedHistory] = useState(!activePortfolioId);

    useEffect(() => {
        const hasHydrated = usePortfolioStore.persist.hasHydrated();
        setIsHydrated(hasHydrated);

        const unsubHydrate = usePortfolioStore.persist.onFinishHydration(() => {
            setIsHydrated(true);
        });

        return () => {
            unsubHydrate();
        };
    }, []);

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

            onHistoryReset();
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

            // The server started this load during render; the page shell
            // streams while it resolves here in the background.
            if (initialStyleChatHistoryPromise) {
                const initial = await initialStyleChatHistoryPromise.catch(
                    (): InitialStyleChatHistoryState => ({
                        history: null,
                        isResolved: false,
                    }),
                );

                if (cancelled) return;

                if (initial.isResolved) {
                    applyLoadedHistory(initial.history);
                    return;
                }
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
        initialStyleChatHistoryPromise,
        lastSyncedHistoryRef,
        onHistoryReset,
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
