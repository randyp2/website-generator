import { Message } from "@/types/preview";
import { afterEach } from "node:test";
import { beforeEach, describe, vi, it, expect } from "vitest";
import {
    createAiMessage,
    createGeneratingMessage,
    createUserMessage,
    normalizeMessages,
} from "./message-helpers";
import { TurbopackMessageSentToBrowser } from "next/dist/server/dev/hot-reloader-types";

describe("message-helpers", () => {
    // Normalize Date.now() before every test case
    beforeEach(() => {
        vi.spyOn(Date, "now").mockReturnValue(1712174400000);
    });

    // Restore Date.now()
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("normalizeMessages", () => {
        it("convert Date ISO strings into Date objects", () => {
            const messages = [
                {
                    id: "m1",
                    role: "user",
                    content: "hello",
                    timestamp: "2026-04-03T20:15:30.000Z",
                },
            ] as unknown as Message[];

            const result: Message[] = normalizeMessages(messages);

            expect(result).toHaveLength(1);
            expect(result[0].timestamp).toBeInstanceOf(Date);
            expect(result[0].timestamp.toISOString()).toBe(
                "2026-04-03T20:15:30.000Z",
            );
        });

        it("keep the date object as date", () => {
            const date = new Date("2026-04-03T20:15:30.000Z");
            const messages: Message[] = [
                {
                    id: "m1",
                    role: "user",
                    content: "hello",
                    timestamp: date,
                },
            ] as unknown as Message[];

            const result: Message[] = normalizeMessages(messages);

            expect(result).toHaveLength(1);
            expect(result[0].timestamp).toBeInstanceOf(Date);
            expect(result[0].timestamp.toISOString()).toBe(date.toISOString());
        });
    });

    describe("createUserMessage", () => {
        it("creates a user message", () => {
            const user_query: string = "hello AI";
            const result: Message = createUserMessage(user_query);

            expect(result.id).toBe("1712174400000");
            expect(result.role).toBe("user");
            expect(result.content).toBe(user_query);
            expect(result.timestamp).toBeInstanceOf(Date);
        });
    });

    describe("createAiMessage", () => {
        it("creates a user message", () => {
            const response: string = "hello Human";
            const result: Message = createAiMessage(response);

            expect(result.id).toBe("ai-1712174400000");
            expect(result.role).toBe("ai");
            expect(result.content).toBe(response);
            expect(result.timestamp).toBeInstanceOf(Date);
        });

        it("applies override to the AI response", () => {
            const customDate = new Date("2026-01-01T00:00:00.000Z");

            const result: Message = createAiMessage("AI response", {
                id: "custom-id",
                timestamp: customDate,
                isGenerating: true,
            });

            expect(result.id).toBe("custom-id");
            expect(result.timestamp).toBe(customDate);
            expect(result.isGenerating).toBe(true);
        });
    });

    describe("createGeneratingMessage", () => {
        it("uses default prefix and sets isGenerating", () => {
            const result: Message = createGeneratingMessage();

            expect(result.id).toBe("ai-temp-1712174400000");
            expect(result.role).toBe("ai");
            expect(result.content).toBe("");
            expect(result.isGenerating).toBe(true);
        });

        it("uses custom prefix and supports overrides", () => {
            const result: Message = createGeneratingMessage("ai-building", {
                content: "building...",
            });

            expect(result.id).toBe("ai-building-1712174400000");
            expect(result.isGenerating).toBe(true);
            expect(result.content).toBe("building...");
        });
    });
});
