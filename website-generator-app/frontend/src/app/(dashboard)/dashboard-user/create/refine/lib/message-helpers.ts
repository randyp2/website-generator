import type { Message } from "@/types/preview";

export const normalizeMessages = (messages: Message[]): Message[] => {
    return messages.map((message) => ({
        ...message,
        timestamp:
            message.timestamp instanceof Date
                ? message.timestamp
                : new Date(message.timestamp),
    }));
};

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
