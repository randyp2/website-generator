import { useCallback, useState } from "react";

import { useToast } from "@/hooks/useToast";
import type { StyleChatResponse } from "@/types/style";

import {
    isInsufficientCreditsFailure,
    parseStyleChatFailure,
    type StyleChatRequestFailure,
} from "./style-chat-utils";

/**
 * Sends style chat API requests and maps boundary errors to UI state.
 */
export const useStyleChatRequest = () => {
    const { addToast } = useToast();
    const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] =
        useState(false);

    const closeInsufficientCreditsModal = useCallback(() => {
        setIsInsufficientCreditsModalOpen(false);
    }, []);

    const handleStyleChatFailure = useCallback(
        (failure: StyleChatRequestFailure, title: string): void => {
            if (isInsufficientCreditsFailure(failure)) {
                setIsInsufficientCreditsModalOpen(true);
                return;
            }

            addToast({
                type: "error",
                title,
                description: failure.message,
            });
        },
        [addToast],
    );

    const requestStyleChat = useCallback(
        async (
            payload: object,
            fallbackMessage: string,
            failureTitle: string,
        ): Promise<StyleChatResponse | null> => {
            const response = await fetch("/api/portfolio/style-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const failure = await parseStyleChatFailure(
                    response,
                    fallbackMessage,
                );
                handleStyleChatFailure(failure, failureTitle);
                return null;
            }

            return (await response.json()) as StyleChatResponse;
        },
        [handleStyleChatFailure],
    );

    return {
        isInsufficientCreditsModalOpen,
        closeInsufficientCreditsModal,
        requestStyleChat,
    };
};
