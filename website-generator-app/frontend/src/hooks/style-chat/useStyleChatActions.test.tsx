// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import type { SetStateAction } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { Message } from "@/types/preview";
import { useStyleChatActions } from "./useStyleChatActions";

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ addToast: vi.fn() }),
}));

describe("useStyleChatActions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        usePortfolioStore.getState().reset();
    });

    it("does not enter thinking state when cached billing denies style chat", async () => {
        let messages: Message[] = [];
        const setStyleMessages = (
            updater: SetStateAction<Message[]>,
        ): void => {
            messages =
                typeof updater === "function" ? updater(messages) : updater;
        };
        const ensurePortfolioGenerationAccess = vi.fn(async () => false);
        const ensurePortfolioDraft = vi.fn(async () => "portfolio-id");
        const requestStyleChat = vi.fn(async () => null);
        const { result } = renderHook(() =>
            useStyleChatActions({
                activePortfolioId: null,
                ensurePortfolioDraft,
                ensurePortfolioGenerationAccess,
                isReadyForInteraction: true,
                requestStyleChat,
                handleStyleChatFailure: vi.fn(),
                setStyleMessages,
                styleMessages: messages,
            }),
        );

        await act(async () => {
            await result.current.handleSend("Make it bold");
        });

        expect(ensurePortfolioGenerationAccess).toHaveBeenCalledOnce();
        expect(ensurePortfolioDraft).not.toHaveBeenCalled();
        expect(requestStyleChat).not.toHaveBeenCalled();
        expect(usePortfolioStore.getState().isSendingStyle).toBe(false);
        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatchObject({
            role: "user",
            content: "Make it bold",
        });
    });
});
