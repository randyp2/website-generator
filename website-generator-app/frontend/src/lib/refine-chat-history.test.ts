import { describe, expect, it } from "vitest";

import {
    isRefineChatHistory,
    toUiRefineMessages,
    type PersistedRefineChatMessage,
} from "./refine-chat-history";

describe("refine-chat-history", () => {
    it("accepts valid persisted refine messages", () => {
        const history: PersistedRefineChatMessage[] = [
            {
                id: "message-1",
                role: "ai",
                content: "I created a plan.",
                timestamp: "2026-07-10T00:00:00.000Z",
                messageType: "plan",
                sectionPlans: [
                    {
                        sectionKey: "hero",
                        action: "modify",
                        instruction: "Tighten the copy",
                        rationale: "The intro should be clearer",
                        intensity: "MEDIUM",
                        preserveElements: ["headline"],
                    },
                ],
                planSummary: "I will refine the hero.",
            },
        ];

        expect(isRefineChatHistory(history)).toBe(true);
    });

    it("rejects invalid refine messages", () => {
        expect(
            isRefineChatHistory([
                {
                    id: "message-1",
                    role: "assistant",
                    content: "Invalid role",
                    timestamp: "2026-07-10T00:00:00.000Z",
                },
            ]),
        ).toBe(false);
    });

    it("converts persisted messages into UI messages", () => {
        const uiMessages = toUiRefineMessages([
            {
                id: "message-1",
                role: "user",
                content: "Refine the hero",
                timestamp: "2026-07-10T00:00:00.000Z",
                messageType: "clarify",
                readyForPlanning: true,
            },
        ]);

        expect(uiMessages).toHaveLength(1);
        expect(uiMessages[0].timestamp).toBeInstanceOf(Date);
        expect(uiMessages[0].timestamp.toISOString()).toBe(
            "2026-07-10T00:00:00.000Z",
        );
        expect(uiMessages[0].readyForPlanning).toBe(true);
    });
});
