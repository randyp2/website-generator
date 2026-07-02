import { useCallback, useRef, useState } from "react";

import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { ColorPresetRecommendation } from "@/types/style";
import type { InitialStyleChatHistoryState } from "@/types/style-chat";

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
    initialStyleChatHistoryPromise?: Promise<InitialStyleChatHistoryState>;
    onPortfolioCreated?: (portfolioId: string) => void;
}) {
    const {
        portfolioId: routePortfolioId,
        templateId,
        initialStyleChatHistoryPromise,
        onPortfolioCreated,
    } = params;
    const isSendingStyle = usePortfolioStore((state) => state.isSendingStyle);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [recommendedColorPresets, setRecommendedColorPresets] = useState<
        ColorPresetRecommendation[]
    >([]);
    const [showTypographyPicker, setShowTypographyPicker] = useState(false);
    const [recommendedHeadingFont, setRecommendedHeadingFont] = useState<
        string | undefined
    >();
    const [recommendedBodyFont, setRecommendedBodyFont] = useState<
        string | undefined
    >();
    const lastSyncedHistoryRef = useRef<string>("");

    const resetRecommendationPanels = useCallback(() => {
        setShowColorPicker(false);
        setRecommendedColorPresets([]);
    }, []);

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
        initialStyleChatHistoryPromise,
        lastSyncedHistoryRef,
        onHistoryReset: resetRecommendationPanels,
    });

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
        isReadyForInteraction,
        requestStyleChat,
        setRecommendedBodyFont,
        setRecommendedColorPresets,
        setRecommendedHeadingFont,
        setShowColorPicker,
        setShowTypographyPicker,
        setStyleMessages,
        styleMessages,
    });

    return {
        portfolioId: activePortfolioId,
        normalizedStyleMessages,
        isLoadingHistory,
        isReadyForInteraction,
        isSending: isSendingStyle,
        showColorPicker,
        recommendedColorPresets,
        showTypographyPicker,
        recommendedHeadingFont,
        recommendedBodyFont,
        isInsufficientCreditsModalOpen,
        closeInsufficientCreditsModal,
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        handleLayoutSubmit,
        flushStyleHistorySync,
    };
}
