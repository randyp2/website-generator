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
import { profileMeQueryKey } from "@/hooks/useProfileMeQuery";
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

    it("opens the credits modal without entering thinking for known insufficient usage", async () => {
        queryClient.setQueryData(profileMeQueryKey, {
            billing: {
                creditEnforcementEnabled: true,
                creditBalance: 0,
                portfolioRefinementAllowanceRemaining: 0,
            },
        });
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
        expect(messages[0]?.isGenerating).not.toBe(true);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(consoleError).not.toHaveBeenCalled();

        act(() => result.current.closeInsufficientCreditsModal());
        expect(result.current.isInsufficientCreditsModalOpen).toBe(false);
    });

    it("continues an already paid refinement session when no allowance remains", async () => {
        queryClient.setQueryData(profileMeQueryKey, {
            billing: {
                creditEnforcementEnabled: true,
                creditBalance: 0,
                portfolioRefinementAllowanceRemaining: 0,
            },
        });
        usePortfolioStore
            .getState()
            .setRefineSessionId("existing-refinement-session");
        fetchMock.mockResolvedValue(
            new Response(
                JSON.stringify({
                    assistantMessage: "I have added that detail to the request.",
                    sessionId: "existing-refinement-session",
                    readyForPlanning: false,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            ),
        );
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
            await result.current.sendMessage("Add it as a new section", []);
        });

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/portfolio/portfolio-1/refine/clarify",
            expect.objectContaining({
                method: "POST",
                body: expect.stringContaining(
                    '"sessionId":"existing-refinement-session"',
                ),
            }),
        );
        expect(result.current.isInsufficientCreditsModalOpen).toBe(false);
        expect(messages).toHaveLength(2);
        expect(messages[0]).toMatchObject({
            role: "user",
            content: "Add it as a new section",
        });
        expect(messages[1]).toMatchObject({
            role: "ai",
            content: "I have added that detail to the request.",
        });
    });
});
