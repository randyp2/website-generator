export type StyleChatRole = "user" | "ai";

export interface PersistedStyleChatMessage {
    id: string;
    role: StyleChatRole;
    content: string;
    timestamp: string;
    suggestions?: string[];
    designTip?: string;
}

