import type { Message } from "@/types/preview";

/**
 * Normalize messages in the case Date is passed as a string
 *
 * @param messages - List of UI messages
 * @returns List of UI messages w/ a normlized timestamp
 */
export const normalizeMessages = (messages: Message[]): Message[] => {
    return messages.map((message) => ({
        ...message,
        timestamp:
            message.timestamp instanceof Date
                ? message.timestamp
                : new Date(message.timestamp),
    }));
};

/**
 * Creates a user message given a user's query
 *
 * @param content - a string representing user's query
 * @returns a Message containing the User's message + metadata
 *
 */
export const createUserMessage = (content: string): Message => {
    return {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
    };
};

export const createAiMessage = (
    content: string,
    overrides: Partial<Message> = {},
): Message => {
    return {
        id: `ai-${Date.now()}`,
        role: "ai",
        content,
        timestamp: new Date(),
        ...overrides,
    };
};

export const createGeneratingMessage = (
    idPrefix = "ai-temp",
    overrides: Partial<Message> = {},
): Message => {
    return createAiMessage("", {
        id: `${idPrefix}-${Date.now()}`,
        isGenerating: true,
        ...overrides,
    });
};
