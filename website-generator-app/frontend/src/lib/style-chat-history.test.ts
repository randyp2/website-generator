import { describe, it, expect } from "vitest";
import {
    isStyleChatHistory,
    toPersistedStyleChatHistory,
    toUiStyleMessages,
} from "./style-chat-history";
import type { Message } from "@/types/preview";
import type { PersistedStyleChatMessage } from "@/types/style-chat";

describe("style-chat-history helpers", () => {
    describe("isStyleChatHistory", () => {
        it("returns true for a valid persisted history array", () => {
            const payload: unknown = [
                {
                    id: "1",
                    role: "user",
                    content: "hellooooo",
                    timestamp: "2026-04-03T20:15:30.000Z",
                },
                {
                    id: "2",
                    role: "ai",
                    content: "hellooooo human",
                    timestamp: "2026-04-03T20:15:30.000Z",
                },
            ];

            expect(isStyleChatHistory(payload)).toBe(true);
        });

        it("returns false when payload is not an array", () => {
            const payload: unknown = { id: "1" };
            expect(isStyleChatHistory(payload)).toBe(false);
        });

        it("returns false when one item has an invalid shape", () => {
            const payload: unknown = [
                {
                    id: "1",
                    role: "system", // invalid role (must be 'user' or 'ai')
                    content: "hello",
                    timestamp: "2026-04-03T20:15:30.000Z",
                },
            ];

            expect(isStyleChatHistory(payload)).toBe(false);
        });

        it("returns false when array contains null or non-object items", () => {
            const payload: unknown = [null];
            expect(isStyleChatHistory(payload)).toBe(false);
        });
    });

    describe("toPersistedStyleChatHistory", () => {
        it("converts Date Timestamps to ISO strings and preserves the optional fields", () => {
            const uiMessages: Message[] = [
                {
                    id: "ai-1",
                    role: "ai",
                    content: "Try this style",
                    timestamp: new Date("2026-04-03T20:15:30.000Z"),
                    suggestions: ["Use more spacing"],
                    designTip: "Increase contrast",
                    previewType: "minimal",
                    isStyleComplete: true,
                    stylePreferences: {
                        tone: "professional",
                        colorScheme: "neutral",
                    },
                },
            ];

            const result = toPersistedStyleChatHistory(uiMessages);

            expect(result[0].timestamp).toBe("2026-04-03T20:15:30.000Z");
            expect(result[0].suggestions).toEqual(["Use more spacing"]);
            expect(result[0].isStyleComplete).toBe(true);
            expect(result[0].stylePreferences).toMatchObject({
                tone: "professional",
                colorScheme: "neutral",
            });
        });

        it("converts non-Date timestamps via new Date(...)", () => {
            const uiMessages = [
                {
                    id: "user-2",
                    role: "user",
                    content: "string timestamp input",
                    timestamp: "2026-04-03T20:15:30.000Z",
                },
            ] as unknown as Message[];

            const result = toPersistedStyleChatHistory(uiMessages);

            expect(result[0].timestamp).toBe("2026-04-03T20:15:30.000Z");
        });
    });

    describe("toUiStyleMessages", () => {
        it("converts persisted timestamp strings into Date objects", () => {
            const persisted: PersistedStyleChatMessage[] = [
                {
                    id: "user-1",
                    role: "user",
                    content: "hello",
                    timestamp: "2026-04-03T20:15:30.000Z",
                },
            ];

            const result = toUiStyleMessages(persisted);

            expect(result[0].timestamp).toBeInstanceOf(Date);
            expect(result[0].timestamp.toISOString()).toBe(
                "2026-04-03T20:15:30.000Z",
            );
        });

        it("preserves optional fields when present", () => {
            const persisted: PersistedStyleChatMessage[] = [
                {
                    id: "ai-2",
                    role: "ai",
                    content: "refined style",
                    timestamp: "2026-04-03T20:15:31.000Z",
                    suggestions: ["Use a neutral palette"],
                    designTip: "Increase section spacing",
                    previewType: "minimal",
                    isStyleComplete: true,
                    stylePreferences: {
                        tone: "professional",
                        colorScheme: "neutral",
                    },
                },
            ];

            const result = toUiStyleMessages(persisted);

            expect(result[0].suggestions).toEqual(["Use a neutral palette"]);
            expect(result[0].designTip).toBe("Increase section spacing");
            expect(result[0].previewType).toBe("minimal");
            expect(result[0].isStyleComplete).toBe(true);
            expect(result[0].stylePreferences).toMatchObject({
                tone: "professional",
                colorScheme: "neutral",
            });
        });
    });
});
