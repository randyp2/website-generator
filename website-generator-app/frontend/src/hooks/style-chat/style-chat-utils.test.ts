import { describe, expect, it } from "vitest";

import type { PersistedStyleChatMessage } from "@/types/style-chat";

import { normalizeInitialStyleChatHistory } from "./style-chat-utils";

describe("style-chat utils", () => {
    describe("normalizeInitialStyleChatHistory", () => {
        it("treats undefined initial history as unresolved", () => {
            expect(normalizeInitialStyleChatHistory(undefined)).toEqual({
                history: null,
                isResolved: false,
            });
        });

        it("preserves resolved null history", () => {
            expect(
                normalizeInitialStyleChatHistory({
                    history: null,
                    isResolved: true,
                }),
            ).toEqual({
                history: null,
                isResolved: true,
            });
        });

        it("preserves valid resolved history", () => {
            const history: PersistedStyleChatMessage[] = [
                {
                    id: "message-1",
                    role: "user",
                    content: "Make it feel premium.",
                    timestamp: "2026-07-02T12:00:00.000Z",
                },
            ];

            expect(
                normalizeInitialStyleChatHistory({
                    history,
                    isResolved: true,
                }),
            ).toEqual({
                history,
                isResolved: true,
            });
        });

        it("treats malformed resolved history as unresolved", () => {
            expect(
                normalizeInitialStyleChatHistory({
                    history: [{ role: "system" }],
                    isResolved: true,
                }),
            ).toEqual({
                history: null,
                isResolved: false,
            });
        });
    });
});
