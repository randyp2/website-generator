import type { Message } from "@/types/preview";
import type { PersistedStyleChatMessage } from "@/types/style-chat";

/**
 * Validates whether an unknown value matches the persisted style chat messages
 *
 * @param value - Untrusted value from storage returned from API
 * @returns True when value is an array that matches the shape of PersistedStyleChatMessage
 */
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

/**
 * Take list of UI shape messages and convert to persisted style shape
 *
 * @param messages - List of UI shaped messages
 * @returns List of PersistedStyleChatMessage to store in DB
 */
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
        ...(message.isStyleComplete && {
            isStyleComplete: message.isStyleComplete,
        }),
        ...(message.stylePreferences && {
            stylePreferences: message.stylePreferences,
        }),
        ...(message.showColorPicker && {
            showColorPicker: message.showColorPicker,
        }),
        ...(message.recommendedColorPresets && {
            recommendedColorPresets: message.recommendedColorPresets,
        }),
        ...(message.showTypographyPicker && {
            showTypographyPicker: message.showTypographyPicker,
        }),
        ...(message.recommendedHeadingFont && {
            recommendedHeadingFont: message.recommendedHeadingFont,
        }),
        ...(message.recommendedBodyFont && {
            recommendedBodyFont: message.recommendedBodyFont,
        }),
    }));

/**
 * Convert PersistedStyleChatMessage to Ui messages
 *
 * @param messages - List of Persisted Style Messages to convert
 * @returns List of UI messages to display on frontend
 */
export const toUiStyleMessages = (
    messages: PersistedStyleChatMessage[],
): Message[] =>
    messages.map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp),
        ...(message.suggestions && { suggestions: message.suggestions }),
        ...(message.designTip && { designTip: message.designTip }),
        ...(message.previewType && { previewType: message.previewType }),
        ...(message.isStyleComplete && {
            isStyleComplete: message.isStyleComplete,
        }),
        ...(message.stylePreferences && {
            stylePreferences: message.stylePreferences,
        }),
        ...(message.showColorPicker && {
            showColorPicker: message.showColorPicker,
        }),
        ...(message.recommendedColorPresets && {
            recommendedColorPresets: message.recommendedColorPresets,
        }),
        ...(message.showTypographyPicker && {
            showTypographyPicker: message.showTypographyPicker,
        }),
        ...(message.recommendedHeadingFont && {
            recommendedHeadingFont: message.recommendedHeadingFont,
        }),
        ...(message.recommendedBodyFont && {
            recommendedBodyFont: message.recommendedBodyFont,
        }),
    }));
