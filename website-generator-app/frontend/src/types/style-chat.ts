export type StyleChatRole = "user" | "ai";

/**
 * Result of the server-side style chat history prefetch. `isResolved: false`
 * means the load failed or could not run, and the client must fetch instead.
 */
export interface InitialStyleChatHistoryState {
    history: PersistedStyleChatMessage[] | null;
    isResolved: boolean;
}

export interface PersistedStyleChatMessage {
    id: string;
    role: StyleChatRole;
    content: string;
    timestamp: string;
    suggestions?: string[];
    designTip?: string;
    previewType?: string | null;
    isStyleComplete?: boolean;
    stylePreferences?: Record<string, string | null>;
}

