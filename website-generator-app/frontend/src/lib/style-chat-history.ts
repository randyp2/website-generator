import type { Message } from "@/types/preview";
import type { PersistedStyleChatMessage } from "@/types/style-chat";

export const isStyleChatHistory = (
    value: unknown,
): value is PersistedStyleChatMessage[] => {
    if (!Array.isArray(value)) return false;
    return value.every((item) => {
        if (!item || typeof item !== "object") return false;
        const row = item as Record<string, unknown>;
        return (
            typeof row.id === "string" &&
            (row.role === "user" || row.role === "ai") &&
            typeof row.content === "string" &&
            typeof row.timestamp === "string"
        );
    });
};

export const toPersistedStyleChatHistory = (
    messages: Message[],
): PersistedStyleChatMessage[] =>
    messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp:
            message.timestamp instanceof Date
                ? message.timestamp.toISOString()
                : new Date(message.timestamp).toISOString(),
        ...(message.suggestions && { suggestions: message.suggestions }),
        ...(message.designTip && { designTip: message.designTip }),
        ...(message.previewType && { previewType: message.previewType }),
        ...(message.isStyleComplete && { isStyleComplete: message.isStyleComplete }),
        ...(message.stylePreferences && { stylePreferences: message.stylePreferences }),
    }));

export const toUiStyleMessages = (
    messages: PersistedStyleChatMessage[],
): Message[] =>
    messages.map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp),
        ...(message.suggestions && { suggestions: message.suggestions }),
        ...(message.designTip && { designTip: message.designTip }),
        ...(message.previewType && { previewType: message.previewType }),
        ...(message.isStyleComplete && { isStyleComplete: message.isStyleComplete }),
        ...(message.stylePreferences && { stylePreferences: message.stylePreferences }),
    }));

