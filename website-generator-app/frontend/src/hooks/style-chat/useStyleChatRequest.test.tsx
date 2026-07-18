// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { profileMeQueryKey } from "@/hooks/useProfileMeQuery";
import { useStyleChatRequest } from "./useStyleChatRequest";

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ addToast: vi.fn() }),
}));

describe("useStyleChatRequest", () => {
    it("opens the modal immediately from known insufficient cached billing", async () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(profileMeQueryKey, {
            billing: {
                creditEnforcementEnabled: true,
                creditBalance: 9,
                portfolioGenerationAllowanceRemaining: 0,
            },
        });
        const StyleChatRequestTestProvider = ({
            children,
        }: {
            children: ReactNode;
        }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
        const { result } = renderHook(() => useStyleChatRequest(), {
            wrapper: StyleChatRequestTestProvider,
        });
        let hasAccess = true;

        await act(async () => {
            hasAccess = await result.current.ensurePortfolioGenerationAccess();
        });

        expect(hasAccess).toBe(false);
        expect(result.current.isInsufficientCreditsModalOpen).toBe(true);
    });
});
