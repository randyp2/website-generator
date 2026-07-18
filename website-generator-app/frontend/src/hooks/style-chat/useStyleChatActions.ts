import { useCallback, type Dispatch, type SetStateAction } from "react";

import { useToast } from "@/hooks/useToast";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { Message } from "@/types/preview";
import type { StyleChatResponse } from "@/types/style";

import {
    mergeStylePreferences,
    StyleChatRequestError,
    toAssistantStyleMessage,
    type StyleChatRequestFailure,
} from "./style-chat-utils";

interface UseStyleChatActionsParams {
    activePortfolioId: string | null;
    ensurePortfolioDraft: () => Promise<string>;
    isReadyForInteraction: boolean;
    requestStyleChat: (
        payload: object,
        fallbackMessage: string,
        failureTitle: string,
    ) => Promise<StyleChatResponse | null>;
    handleStyleChatFailure: (
        failure: StyleChatRequestFailure,
        title: string,
    ) => void;
    setStyleMessages: Dispatch<SetStateAction<Message[]>>;
    styleMessages: Message[];
}

/**
 * Builds the interactive style chat command handlers.
 */
export const useStyleChatActions = ({
    activePortfolioId,
    ensurePortfolioDraft,
    isReadyForInteraction,
    handleStyleChatFailure,
    requestStyleChat,
    setStyleMessages,
    styleMessages,
}: UseStyleChatActionsParams) => {
    const { addToast } = useToast();
    const { stylePreferences, setStylePreferences, setIsSendingStyle } =
        usePortfolioStore();

    const appendAssistantMessage = useCallback(
        (data: StyleChatResponse) => {
            setStyleMessages((prev) => [...prev, toAssistantStyleMessage(data)]);
        },
        [setStyleMessages],
    );

    const mergeIncomingStylePreferences = useCallback(
        (data: StyleChatResponse) => {
            if (!data.stylePreferences) return;
            setStylePreferences(
                mergeStylePreferences(stylePreferences, data.stylePreferences),
            );
        },
        [setStylePreferences, stylePreferences],
    );

    const handleSend = useCallback(
        async (prompt: string) => {
            if (!isReadyForInteraction) return;

            const hasUserMessages = styleMessages.some(
                (message) => message.role === "user",
            );
            if (!hasUserMessages) {
                const seededNotes = stylePreferences.customNotes?.trim()
                    ? `${stylePreferences.customNotes}\n${prompt}`
                    : prompt;
                setStylePreferences({
                    ...stylePreferences,
                    customNotes: seededNotes,
                });
            }

            setStyleMessages((prev) => [
                ...prev,
                {
                    id: `user-${Date.now()}`,
                    role: "user",
                    content: prompt,
                    timestamp: new Date(),
                },
            ]);

            setIsSendingStyle(true);
            try {
                const targetPortfolioId = await ensurePortfolioDraft();
                console.log(
                    "[style-chat] Sending message with stylePrefs:",
                    stylePreferences,
                );
                const data = await requestStyleChat(
                    { portfolioId: targetPortfolioId, userMessage: prompt },
                    "Style chat request failed.",
                    "Style chat unavailable",
                );
                if (!data) return;

                console.log("[style-chat] API response:", {
                    suggestions: data.suggestions,
                    previewType: data.previewType,
                    designTip: data.designTip,
                });

                appendAssistantMessage(data);

                if (data.stylePreferences) {
                    console.log(
                        "[style-chat] Received stylePrefs update:",
                        data.stylePreferences,
                    );
                    mergeIncomingStylePreferences(data);
                }
            } catch (error) {
                console.error("Style chat error:", error);
                if (error instanceof StyleChatRequestError) {
                    handleStyleChatFailure(
                        error.failure,
                        "Portfolio creation unavailable",
                    );
                    return;
                }
                addToast({
                    type: "error",
                    title: "Style chat unavailable",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Unable to send your style message right now.",
                });
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            addToast,
            appendAssistantMessage,
            ensurePortfolioDraft,
            handleStyleChatFailure,
            isReadyForInteraction,
            mergeIncomingStylePreferences,
            requestStyleChat,
            setIsSendingStyle,
            setStyleMessages,
            setStylePreferences,
            styleMessages,
            stylePreferences,
        ],
    );

    const handleColorSubmit = useCallback(
        async (colors: Record<string, string>) => {
            if (!isReadyForInteraction) return;

            const colorSummary = Object.entries(colors)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");

            setStyleMessages((prev) => [
                ...prev,
                {
                    id: `user-colors-${Date.now()}`,
                    role: "user",
                    content: `Selected colors: ${colorSummary}`,
                    timestamp: new Date(),
                },
            ]);

            if (!activePortfolioId) return;

            setIsSendingStyle(true);
            try {
                console.log(
                    "[style-chat] Submitting colors with stylePrefs:",
                    stylePreferences,
                );
                const data = await requestStyleChat(
                    {
                        portfolioId: activePortfolioId,
                        colorSelections: colors,
                    },
                    "Color submission failed.",
                    "Color update unavailable",
                );
                if (!data) return;

                appendAssistantMessage(data);

                if (data.stylePreferences) {
                    console.log(
                        "[style-chat] Received stylePrefs update:",
                        data.stylePreferences,
                    );
                    mergeIncomingStylePreferences(data);
                }
            } catch (error) {
                console.error("Color submit error:", error);
                addToast({
                    type: "error",
                    title: "Color update unavailable",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Unable to submit your selected colors right now.",
                });
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            activePortfolioId,
            addToast,
            appendAssistantMessage,
            isReadyForInteraction,
            mergeIncomingStylePreferences,
            requestStyleChat,
            setIsSendingStyle,
            setStyleMessages,
            stylePreferences,
        ],
    );

    const handleFontSubmit = useCallback(
        async (fonts: { heading: string; body: string }) => {
            if (!isReadyForInteraction) return;

            const fontSummary = `Heading: ${fonts.heading}, Body: ${fonts.body}`;

            setStyleMessages((prev) => [
                ...prev,
                {
                    id: `user-fonts-${Date.now()}`,
                    role: "user",
                    content: `Selected fonts: ${fontSummary}`,
                    timestamp: new Date(),
                },
            ]);

            if (!activePortfolioId) return;

            setIsSendingStyle(true);
            try {
                const data = await requestStyleChat(
                    {
                        portfolioId: activePortfolioId,
                        fontSelections: {
                            heading: fonts.heading,
                            body: fonts.body,
                        },
                    },
                    "Font submission failed.",
                    "Typography update unavailable",
                );
                if (!data) return;

                appendAssistantMessage(data);
                mergeIncomingStylePreferences(data);
            } catch (error) {
                console.error("Font submit error:", error);
                addToast({
                    type: "error",
                    title: "Typography update unavailable",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Unable to submit your typography choices right now.",
                });
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            activePortfolioId,
            addToast,
            appendAssistantMessage,
            isReadyForInteraction,
            mergeIncomingStylePreferences,
            requestStyleChat,
            setIsSendingStyle,
            setStyleMessages,
        ],
    );

    const handleLayoutSubmit = useCallback(
        async (layoutName: string) => {
            if (!isReadyForInteraction) return;

            setStyleMessages((prev) => [
                ...prev,
                {
                    id: `user-layout-${Date.now()}`,
                    role: "user",
                    content: `Selected layout: ${layoutName}`,
                    timestamp: new Date(),
                },
            ]);

            if (!activePortfolioId) return;

            setIsSendingStyle(true);
            try {
                const data = await requestStyleChat(
                    {
                        portfolioId: activePortfolioId,
                        layoutSelection: layoutName,
                    },
                    "Layout submission failed.",
                    "Layout update unavailable",
                );
                if (!data) return;

                appendAssistantMessage(data);
                mergeIncomingStylePreferences(data);
            } catch (error) {
                console.error("Layout submit error:", error);
                addToast({
                    type: "error",
                    title: "Layout update unavailable",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Unable to submit your layout choice right now.",
                });
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            activePortfolioId,
            addToast,
            appendAssistantMessage,
            isReadyForInteraction,
            mergeIncomingStylePreferences,
            requestStyleChat,
            setIsSendingStyle,
            setStyleMessages,
        ],
    );

    return {
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        handleLayoutSubmit,
    };
};
