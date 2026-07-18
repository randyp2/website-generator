import { useMemo, useRef } from "react";

import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { InitialStyleChatHistoryState } from "@/types/style-chat";

import { deriveStyleChatPanelState } from "./style-chat/style-chat-utils";
import { useStyleChatActions } from "./style-chat/useStyleChatActions";
import { useStyleChatDraft } from "./style-chat/useStyleChatDraft";
import { useStyleChatHistory } from "./style-chat/useStyleChatHistory";
import { useStyleChatPersistence } from "./style-chat/useStyleChatPersistence";
import { useStyleChatRequest } from "./style-chat/useStyleChatRequest";

/**
 * Manages the style chat lifecycle after initial route data has been loaded.
 */
export function useStyleChat(params: {
    portfolioId: string | null;
    templateId: string | null;
    initialStyleChatHistory?: InitialStyleChatHistoryState | null;
    onPortfolioCreated?: (portfolioId: string) => void;
}) {
    const {
        portfolioId: routePortfolioId,
        templateId,
        initialStyleChatHistory,
        onPortfolioCreated,
    } = params;
    const isSendingStyle = usePortfolioStore((state) => state.isSendingStyle);
    const lastSyncedHistoryRef = useRef<string>("");

    const { activePortfolioId, createdDraftIdRef, ensurePortfolioDraft } =
        useStyleChatDraft({
            routePortfolioId,
            templateId,
            onPortfolioCreated,
        });

    const {
        hasLoadedHistory,
        isHydrated,
        isLoadingHistory,
        isReadyForInteraction,
        normalizedStyleMessages,
        setStyleMessages,
        styleMessages,
    } = useStyleChatHistory({
        activePortfolioId,
        createdDraftIdRef,
        initialStyleChatHistory,
        lastSyncedHistoryRef,
    });

    const panelState = useMemo(
        () => deriveStyleChatPanelState(styleMessages),
        [styleMessages],
    );

    const { flushStyleHistorySync } = useStyleChatPersistence({
        activePortfolioId,
        hasLoadedHistory,
        isHydrated,
        lastSyncedHistoryRef,
        styleMessages,
    });

    const {
        isInsufficientCreditsModalOpen,
        closeInsufficientCreditsModal,
        handleStyleChatFailure,
        requestStyleChat,
    } = useStyleChatRequest();

    const {
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        handleLayoutSubmit,
    } = useStyleChatActions({
        activePortfolioId,
        ensurePortfolioDraft,
        handleStyleChatFailure,
        isReadyForInteraction,
        requestStyleChat,
        setStyleMessages,
        styleMessages,
    });

    return {
        portfolioId: activePortfolioId,
        normalizedStyleMessages,
        isLoadingHistory,
        isReadyForInteraction,
        isSending: isSendingStyle,
        showColorPicker: panelState.showColorPicker,
        recommendedColorPresets: panelState.recommendedColorPresets,
        showTypographyPicker: panelState.showTypographyPicker,
        recommendedHeadingFont: panelState.recommendedHeadingFont,
        recommendedBodyFont: panelState.recommendedBodyFont,
        isInsufficientCreditsModalOpen,
        closeInsufficientCreditsModal,
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        handleLayoutSubmit,
        flushStyleHistorySync,
    };
}
