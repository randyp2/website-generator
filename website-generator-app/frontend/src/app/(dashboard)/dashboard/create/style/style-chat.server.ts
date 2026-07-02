import "server-only";

import { getBackendUrl } from "@/lib/server-env";
import { isStyleChatHistory } from "@/lib/style-chat-history";
import type { PersistedStyleChatMessage } from "@/types/style-chat";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export interface InitialStyleChatHistoryState {
    history: PersistedStyleChatMessage[] | null;
    isResolved: boolean;
}

interface BackendPortfolioPayload {
    portfolio?: {
        styleChatHistory?: unknown;
        style_chat_history?: unknown;
    };
}

const readStyleChatHistory = (
    payload: BackendPortfolioPayload,
): PersistedStyleChatMessage[] => {
    const rawHistory =
        payload.portfolio?.styleChatHistory ??
        payload.portfolio?.style_chat_history;

    return isStyleChatHistory(rawHistory) ? rawHistory : [];
};

/**
 * Loads route-critical style chat history before the client chat hydrates.
 */
export const loadInitialStyleChatHistory = async (
    portfolioId: string | null,
): Promise<InitialStyleChatHistoryState> => {
    if (!portfolioId) {
        return { history: null, isResolved: true };
    }

    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        return { history: null, isResolved: false };
    }

    try {
        const response = await fetch(
            `${getBackendUrl()}/api/v1/portfolio/${portfolioId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                cache: "no-store",
            },
        );

        if (!response.ok) {
            console.error("Initial style chat history load failed:", response.status);
            return { history: null, isResolved: false };
        }

        const payload = (await response.json()) as BackendPortfolioPayload;
        return {
            history: readStyleChatHistory(payload),
            isResolved: true,
        };
    } catch (error) {
        console.error("Initial style chat history load errored:", error);
        return { history: null, isResolved: false };
    }
};
