import { describe, expect, it } from "vitest";

import type { Message } from "@/types/preview";
import type { ColorPresetRecommendation } from "@/types/style";
import type { PersistedStyleChatMessage } from "@/types/style-chat";

import {
    deriveStyleChatPanelState,
    normalizeInitialStyleChatHistory,
    toAssistantStyleMessage,
} from "./style-chat-utils";

const recommendedPalette: ColorPresetRecommendation = {
    name: "Amber Editorial",
    description: "Warm premium neutrals with amber accents.",
    colors: {
        primary: "#eca449",
        secondary: "#4b2d17",
        accent: "#f6c76f",
        background: "#101010",
        text: "#fff8ea",
        muted: "#2d241a",
    },
};

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

    describe("deriveStyleChatPanelState", () => {
        it("reopens the color picker from the latest assistant message", () => {
            const message = toAssistantStyleMessage({
                assistantMessage: "Pick a palette.",
                questionNumber: 2,
                totalQuestions: 4,
                isComplete: false,
                showColorPicker: true,
                recommendedColorPresets: [recommendedPalette],
            });

            expect(deriveStyleChatPanelState([message])).toEqual({
                recommendedBodyFont: undefined,
                recommendedColorPresets: [recommendedPalette],
                recommendedHeadingFont: undefined,
                showColorPicker: true,
                showTypographyPicker: false,
            });
        });

        it("keeps pickers closed when a user selection follows", () => {
            const assistantMessage = toAssistantStyleMessage({
                assistantMessage: "Pick a palette.",
                questionNumber: 2,
                totalQuestions: 4,
                isComplete: false,
                showColorPicker: true,
                recommendedColorPresets: [recommendedPalette],
            });
            const userMessage: Message = {
                id: "user-colors-1",
                role: "user",
                content: "Selected colors: primary: #eca449",
                timestamp: new Date("2026-07-02T12:01:00.000Z"),
            };

            expect(
                deriveStyleChatPanelState([assistantMessage, userMessage]),
            ).toEqual({
                recommendedBodyFont: undefined,
                recommendedColorPresets: [],
                recommendedHeadingFont: undefined,
                showColorPicker: false,
                showTypographyPicker: false,
            });
        });

        it("reopens the typography picker from the latest assistant message", () => {
            const message = toAssistantStyleMessage({
                assistantMessage: "Pick typography.",
                questionNumber: 3,
                totalQuestions: 4,
                isComplete: false,
                showTypographyPicker: true,
                recommendedHeadingFont: "Inter",
                recommendedBodyFont: "Source Serif 4",
            });

            expect(deriveStyleChatPanelState([message])).toEqual({
                recommendedBodyFont: "Source Serif 4",
                recommendedColorPresets: [],
                recommendedHeadingFont: "Inter",
                showColorPicker: false,
                showTypographyPicker: true,
            });
        });
    });
});
