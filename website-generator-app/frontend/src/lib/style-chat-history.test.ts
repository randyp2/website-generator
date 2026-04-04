import { describe, it, expect } from "vitest";
import {
    isStyleChatHistory,
    toPersistedStyleChatHistory,
    toUiStyleMessages,
} from "./style-chat-history";
import { Message } from "@/types/preview";
import { PersistedStyleChatMessage } from "@/types/style-chat";

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
    });
});
