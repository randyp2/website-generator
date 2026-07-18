// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { Message } from "@/types/preview";
import { useRefineChat } from "./useRefineChat";

const fetchMock = vi.fn();

describe("useRefineChat", () => {
    let messages: Message[];
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", fetchMock);
        usePortfolioStore.getState().reset();
        messages = [];
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
    });

    afterEach(() => {
        cleanup();
        queryClient.clear();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("opens the credits modal without logging an expected 402 as an error", async () => {
        fetchMock.mockResolvedValue(
            Response.json(
                {
                    code: "INSUFFICIENT_CREDITS",
                    error:
                        "A portfolio refinement allowance or at least 9 credits is required.",
                },
                { status: 402 },
            ),
        );
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const wrapper = ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
        const { result } = renderHook(
            () =>
                useRefineChat({
                    portfolioId: "portfolio-1",
                    sections: [],
                    mediaFilesCount: 0,
                    videoFilesCount: 0,
                    setSections: vi.fn(),
                    setGlobalTheme: vi.fn(),
                    setMessages: (updater) => {
                        messages =
                            typeof updater === "function"
                                ? updater(messages)
                                : updater;
                    },
                    removeMediaFile: vi.fn(),
                    removeVideoFile: vi.fn(),
                }),
            { wrapper },
        );

        await act(async () => {
            await result.current.sendMessage("Update the hero", []);
        });

        expect(result.current.isInsufficientCreditsModalOpen).toBe(true);
        expect(result.current.isGenerating).toBe(false);
        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatchObject({
            role: "user",
            content: "Update the hero",
        });
        expect(consoleError).not.toHaveBeenCalled();

        act(() => result.current.closeInsufficientCreditsModal());
        expect(result.current.isInsufficientCreditsModalOpen).toBe(false);
    });
});
