// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { refetchVersionsMock, useVersionsMock } = vi.hoisted(() => ({
    refetchVersionsMock: vi.fn<() => Promise<void>>(),
    useVersionsMock: vi.fn(),
}));

vi.mock("@/hooks/useVersions", () => ({
    useVersions: useVersionsMock,
}));

vi.mock("@/components/chat/style-chat/StyleChatComposer", () => ({
    StyleChatComposer: () => <div data-testid="style-chat-composer" />,
}));

vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: {
        div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    },
}));

vi.mock("./sidebar-chat/UploadedFilePills", () => ({
    UploadedFilePills: () => null,
}));

vi.mock("./version-timeline", () => ({
    VersionTimelineDrawer: () => null,
    VersionTimelineTrigger: () => null,
}));

import { RefineChatPromptBar } from "./RefineChatPromptBar";

describe("RefineChatPromptBar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        refetchVersionsMock.mockResolvedValue(undefined);
        useVersionsMock.mockReturnValue({
            versions: [],
            isLoading: false,
            error: null,
            refetch: refetchVersionsMock,
            activateVersion: vi.fn(),
            isActivating: false,
            makeLive: vi.fn(),
            isMakingLive: false,
        });
    });

    afterEach(() => cleanup());

    it("refreshes versions when a refinement build completes", async () => {
        const props = {
            uploadedFiles: [],
            onSendMessage: vi.fn(),
            onFileSelect: vi.fn(),
            onRemoveFile: vi.fn(),
            portfolioId: "portfolio-1",
            onDownload: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
        };
        const { rerender } = render(
            <RefineChatPromptBar
                {...props}
                isGenerating
                versionsRefreshKey={0}
            />,
        );

        expect(refetchVersionsMock).not.toHaveBeenCalled();

        rerender(
            <RefineChatPromptBar
                {...props}
                isGenerating={false}
                versionsRefreshKey={0}
            />,
        );
        expect(refetchVersionsMock).not.toHaveBeenCalled();

        rerender(
            <RefineChatPromptBar
                {...props}
                isGenerating={false}
                versionsRefreshKey={1}
            />,
        );

        await waitFor(() => {
            expect(refetchVersionsMock).toHaveBeenCalledOnce();
        });
    });
});
