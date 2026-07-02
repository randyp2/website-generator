import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type {
    ColorPresetColors,
    ColorPresetRecommendation,
    StylePreferences,
    StyleChatResponse,
} from "@/types/style";
import type { Message } from "@/types/preview";
import type { PersistedStyleChatMessage } from "@/types/style-chat";
import {
    isStyleChatHistory,
    toPersistedStyleChatHistory,
    toUiStyleMessages,
} from "@/lib/style-chat-history";

const DEFAULT_TEMPLATE_ID = "blank";
const STYLE_CHAT_SYNC_DEBOUNCE_MS = 800;
const INSUFFICIENT_CREDITS_CODE = "INSUFFICIENT_CREDITS";

const createIntroStyleMessage = (): Message => ({
    id: "style-assistant-intro",
    role: "ai",
    content:
        "Hey! I'm your design consultant. Tell me about your vision - what's the overall theme or goal for your portfolio? For example: 'clean minimalist developer portfolio' or 'bold creative agency showcase'.",
    timestamp: new Date(),
});

type StyleChatErrorPayload = {
    code?: string;
    error?: string;
    message?: string;
};

type StyleChatRequestFailure = {
    code?: string;
    message: string;
    status: number;
};

const toInitialStyleMessages = (
    history: PersistedStyleChatMessage[] | null | undefined,
): Message[] => {
    if (isStyleChatHistory(history) && history.length > 0) {
        return toUiStyleMessages(history);
    }

    return [createIntroStyleMessage()];
};

const parseStyleChatFailure = async (
    response: Response,
    fallbackMessage: string,
): Promise<StyleChatRequestFailure> => {
    const payload =
        ((await response.json().catch(() => null)) as StyleChatErrorPayload | null) ??
        null;

    const message =
        payload?.error?.trim() ||
        payload?.message?.trim() ||
        fallbackMessage;
    const code = payload?.code?.trim();

    return {
        status: response.status,
        code: code || undefined,
        message,
    };
};

const isInsufficientCreditsFailure = (
    failure: StyleChatRequestFailure,
): boolean =>
    failure.status === 402 || failure.code === INSUFFICIENT_CREDITS_CODE;

function mergeStylePreferences(
    current: StylePreferences,
    incoming: Partial<StylePreferences>,
): StylePreferences {
    return {
        colorScheme: incoming.colorScheme ?? current.colorScheme,
        layoutDensity: incoming.layoutDensity ?? current.layoutDensity,
        tone: incoming.tone ?? current.tone,
        visualStyle: incoming.visualStyle ?? current.visualStyle,
        sectionEmphasis: incoming.sectionEmphasis ?? current.sectionEmphasis,
        typography: incoming.typography ?? current.typography,
        animationStyle: incoming.animationStyle ?? current.animationStyle,
        whitespace: incoming.whitespace ?? current.whitespace,
        imageryStyle: incoming.imageryStyle ?? current.imageryStyle,
        interactiveElements: incoming.interactiveElements ?? current.interactiveElements,
        customNotes: incoming.customNotes?.trim() || current.customNotes,
    };
}

function normalizeRecommendedPresets(value: unknown): ColorPresetRecommendation[] {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const normalized: ColorPresetRecommendation[] = [];

    const parseColors = (colors: unknown): ColorPresetColors | null => {
        if (!colors || typeof colors !== "object") return null;
        const colorMap = colors as Record<string, unknown>;

        const primary =
            typeof colorMap.primary === "string" ? colorMap.primary.trim() : "";
        const secondary =
            typeof colorMap.secondary === "string" ? colorMap.secondary.trim() : "";
        const accent = typeof colorMap.accent === "string" ? colorMap.accent.trim() : "";
        const background =
            typeof colorMap.background === "string"
                ? colorMap.background.trim()
                : "";
        const text = typeof colorMap.text === "string" ? colorMap.text.trim() : "";
        const muted = typeof colorMap.muted === "string" ? colorMap.muted.trim() : "";

        if (!primary || !secondary || !accent || !background || !text || !muted) {
            return null;
        }

        return {
            primary,
            secondary,
            accent,
            background,
            text,
            muted,
        };
    };

    for (const item of value) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const name = typeof row.name === "string" ? row.name.trim() : "";
        const description =
            typeof row.description === "string"
                ? row.description.trim()
                : "Custom AI-generated palette.";
        if (!name) continue;

        const normalizedColors = parseColors(row.colors);
        if (!normalizedColors) continue;

        const dedupeKey = name.toLowerCase();
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        normalized.push({
            name,
            description,
            colors: normalizedColors,
        });
        if (normalized.length >= 3) break;
    }

    return normalized;
}

/**
 * Manages the style chat lifecycle after initial route data has been loaded.
 */
export function useStyleChat(params: {
    portfolioId: string | null;
    templateId: string | null;
    initialStyleChatHistory?: PersistedStyleChatMessage[] | null;
    isInitialStyleChatHistoryResolved?: boolean;
    onPortfolioCreated?: (portfolioId: string) => void;
}) {
    const {
        portfolioId: routePortfolioId,
        templateId,
        initialStyleChatHistory,
        isInitialStyleChatHistoryResolved = false,
        onPortfolioCreated,
    } = params;
    const { addToast } = useToast();

    const {
        setTemplateId,
        setPortfolioId,
        stylePreferences,
        setStyleMessages: setPersistedStyleMessages,
        setStylePreferences,
        isSendingStyle,
        setIsSendingStyle,
    } = usePortfolioStore();

    const [isHydrated, setIsHydrated] = useState(false);
    const [styleMessages, setStyleMessages] = useState<Message[]>(() =>
        toInitialStyleMessages(initialStyleChatHistory),
    );
    const [hasLoadedHistory, setHasLoadedHistory] = useState(
        isInitialStyleChatHistoryResolved || !routePortfolioId,
    );
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [recommendedColorPresets, setRecommendedColorPresets] = useState<ColorPresetRecommendation[]>([]);
    const [showTypographyPicker, setShowTypographyPicker] = useState(false);
    const [recommendedHeadingFont, setRecommendedHeadingFont] = useState<string | undefined>();
    const [recommendedBodyFont, setRecommendedBodyFont] = useState<string | undefined>();
    const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] = useState(false);
    const [activePortfolioId, setActivePortfolioId] = useState<string | null>(routePortfolioId);
    const createdDraftIdRef = useRef<string | null>(null);
    const draftCreationPromiseRef = useRef<Promise<string> | null>(null);
    const styleSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSyncedHistoryRef = useRef<string>("");

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

    useEffect(() => {
        setActivePortfolioId(routePortfolioId);
    }, [routePortfolioId]);

    const ensurePortfolioDraft = useCallback(async (): Promise<string> => {
        if (activePortfolioId) return activePortfolioId;
        if (draftCreationPromiseRef.current) return draftCreationPromiseRef.current;

        const draftTemplateId = templateId?.trim() || DEFAULT_TEMPLATE_ID;

        draftCreationPromiseRef.current = (async () => {
            const res = await fetch("/api/portfolio/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId: draftTemplateId }),
            });

            if (!res.ok) {
                const errorBody = await res.json().catch(() => null);
                throw new Error(errorBody?.error ?? "Failed to create draft");
            }

            const data = await res.json();
            const createdPortfolioId = data?.portfolio?.id;
            if (!createdPortfolioId || typeof createdPortfolioId !== "string") {
                throw new Error("Draft was created without a portfolio id");
            }

            createdDraftIdRef.current = createdPortfolioId;
            setTemplateId(draftTemplateId);
            setPortfolioId(createdPortfolioId);
            setActivePortfolioId(createdPortfolioId);
            onPortfolioCreated?.(createdPortfolioId);

            return createdPortfolioId;
        })();

        try {
            return await draftCreationPromiseRef.current;
        } finally {
            draftCreationPromiseRef.current = null;
        }
    }, [
        activePortfolioId,
        onPortfolioCreated,
        setPortfolioId,
        setTemplateId,
        templateId,
    ]);

    // Effect 1: Hydration watcher
    useEffect(() => {
        const hasHydrated = usePortfolioStore.persist.hasHydrated();
        setIsHydrated(hasHydrated);

        const unsubHydrate = usePortfolioStore.persist.onFinishHydration(() => {
            setIsHydrated(true);
        });

        return () => {
            unsubHydrate();
        };
    }, []);

    // Effect 2: Seed or load chat history
    useEffect(() => {
        if (!isHydrated) return;

        let cancelled = false;

        const applyLoadedHistory = (
            history: PersistedStyleChatMessage[] | null | undefined,
        ) => {
            if (cancelled) return;

            if (isStyleChatHistory(history) && history.length > 0) {
                lastSyncedHistoryRef.current = JSON.stringify(history);
            } else {
                lastSyncedHistoryRef.current = "";
            }

            setShowColorPicker(false);
            setRecommendedColorPresets([]);
            setStyleMessages(toInitialStyleMessages(history));
            setHasLoadedHistory(true);
        };

        const loadHistory = async () => {
            if (!activePortfolioId) {
                applyLoadedHistory(null);
                return;
            }

            if (createdDraftIdRef.current === activePortfolioId) {
                setHasLoadedHistory(true);
                return;
            }

            if (isInitialStyleChatHistoryResolved) {
                applyLoadedHistory(initialStyleChatHistory);
                return;
            }

            setHasLoadedHistory(false);
            lastSyncedHistoryRef.current = "";

            try {
                const res = await fetch(`/api/portfolio/${activePortfolioId}/get`);
                const data = res.ok ? await res.json() : null;
                const rawHistory = data?.portfolio?.style_chat_history;

                if (cancelled) return;

                if (isStyleChatHistory(rawHistory) && rawHistory.length > 0) {
                    lastSyncedHistoryRef.current = JSON.stringify(rawHistory);
                    setStyleMessages(toUiStyleMessages(rawHistory));
                } else {
                    applyLoadedHistory(null);
                }
            } catch {
                if (cancelled) return;
                applyLoadedHistory(null);
            } finally {
                if (!cancelled) {
                    setHasLoadedHistory(true);
                }
            }
        };

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, [
        activePortfolioId,
        initialStyleChatHistory,
        isHydrated,
        isInitialStyleChatHistoryResolved,
    ]);

    useEffect(() => {
        if (!isHydrated || !hasLoadedHistory) return;
        setPersistedStyleMessages(styleMessages);
    }, [
        hasLoadedHistory,
        isHydrated,
        setPersistedStyleMessages,
        styleMessages,
    ]);

    // Normalize timestamps for rendering
    const normalizedStyleMessages = useMemo(
        () =>
            styleMessages.map((message) => ({
                ...message,
                timestamp:
                    message.timestamp instanceof Date
                        ? message.timestamp
                        : new Date(message.timestamp),
            })),
        [styleMessages],
    );
    const isLoadingHistory = !hasLoadedHistory;
    const isReadyForInteraction = isHydrated && hasLoadedHistory;

    // Effect 3: Sync templateId/portfolioId to store
    useEffect(() => {
        if (templateId) {
            setTemplateId(templateId);
        }
        if (activePortfolioId) {
            setPortfolioId(activePortfolioId);
        }
    }, [activePortfolioId, setPortfolioId, setTemplateId, templateId]);

    // Effect 4: Patch last_step to DB
    useEffect(() => {
        if (!activePortfolioId) return;
        fetch(`/api/portfolio/${activePortfolioId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "style" }),
        }).catch(() => null);
    }, [activePortfolioId]);

    // Sync helper
    const syncStyleHistoryToDb = useCallback(
        async (serializedHistory: string) => {
            if (!activePortfolioId) return;

            const parsedHistory = JSON.parse(
                serializedHistory,
            ) as PersistedStyleChatMessage[];

            const res = await fetch(`/api/portfolio/${activePortfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    style_chat_history: parsedHistory,
                }),
            }).catch(() => null);

            if (res?.ok) {
                lastSyncedHistoryRef.current = serializedHistory;
            }
        },
        [activePortfolioId],
    );

    const flushStyleHistorySync = useCallback(async () => {
        if (!isHydrated || !activePortfolioId || !hasLoadedHistory) return;

        if (styleSyncTimeoutRef.current) {
            clearTimeout(styleSyncTimeoutRef.current);
            styleSyncTimeoutRef.current = null;
        }

        const serializedHistory = JSON.stringify(
            toPersistedStyleChatHistory(styleMessages),
        );
        if (serializedHistory === lastSyncedHistoryRef.current) {
            return;
        }

        await syncStyleHistoryToDb(serializedHistory);
    }, [
        hasLoadedHistory,
        isHydrated,
        activePortfolioId,
        styleMessages,
        syncStyleHistoryToDb,
    ]);

    const requestStyleChat = useCallback(
        async (
            payload: object,
            fallbackMessage: string,
            failureTitle: string,
        ): Promise<StyleChatResponse | null> => {
            const res = await fetch("/api/portfolio/style-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const failure = await parseStyleChatFailure(res, fallbackMessage);
                handleStyleChatFailure(failure, failureTitle);
                return null;
            }

            return (await res.json()) as StyleChatResponse;
        },
        [handleStyleChatFailure],
    );

    // Effect 5: Debounced styleMessages sync to DB
    useEffect(() => {
        if (!isHydrated || !activePortfolioId || !hasLoadedHistory) return;

        const serializedHistory = JSON.stringify(
            toPersistedStyleChatHistory(styleMessages),
        );
        if (serializedHistory === lastSyncedHistoryRef.current) {
            return;
        }

        if (styleSyncTimeoutRef.current) {
            clearTimeout(styleSyncTimeoutRef.current);
        }

        styleSyncTimeoutRef.current = setTimeout(() => {
            void syncStyleHistoryToDb(serializedHistory);
            styleSyncTimeoutRef.current = null;
        }, STYLE_CHAT_SYNC_DEBOUNCE_MS);

        return () => {
            if (styleSyncTimeoutRef.current) {
                clearTimeout(styleSyncTimeoutRef.current);
                styleSyncTimeoutRef.current = null;
            }
        };
    }, [
        hasLoadedHistory,
        isHydrated,
        activePortfolioId,
        styleMessages,
        syncStyleHistoryToDb,
    ]);

    const handleSend = useCallback(
        async (prompt: string) => {
            if (!isReadyForInteraction) return;

            const hasUserMessages = styleMessages.some((m) => m.role === "user");
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

                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: data.assistantMessage,
                        timestamp: new Date(),
                        ...(data.suggestions && { suggestions: data.suggestions }),
                        ...(data.designTip && { designTip: data.designTip }),
                        ...(data.previewType && { previewType: data.previewType }),
                        ...(data.isComplete && { isStyleComplete: true }),
                        ...(data.isComplete && data.stylePreferences && { stylePreferences: data.stylePreferences }),
                    },
                ]);

                setShowColorPicker(Boolean(data.showColorPicker));
                setRecommendedColorPresets(
                    data.showColorPicker
                        ? normalizeRecommendedPresets(data.recommendedColorPresets)
                        : [],
                );

                if (data.showTypographyPicker) {
                    setShowTypographyPicker(true);
                    setRecommendedHeadingFont(data.recommendedHeadingFont ?? undefined);
                    setRecommendedBodyFont(data.recommendedBodyFont ?? undefined);
                }

                if (data.stylePreferences) {
                    console.log(
                        "[style-chat] Received stylePrefs update:",
                        data.stylePreferences,
                    );
                    setStylePreferences(
                        mergeStylePreferences(stylePreferences, data.stylePreferences),
                    );
                }
            } catch (error) {
                console.error("Style chat error:", error);
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
            ensurePortfolioDraft,
            isReadyForInteraction,
            styleMessages,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
            addToast,
            requestStyleChat,
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

            setShowColorPicker(false);
            setRecommendedColorPresets([]);

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

                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: data.assistantMessage,
                        timestamp: new Date(),
                        ...(data.suggestions && { suggestions: data.suggestions }),
                        ...(data.designTip && { designTip: data.designTip }),
                        ...(data.previewType && { previewType: data.previewType }),
                        ...(data.isComplete && { isStyleComplete: true }),
                        ...(data.isComplete && data.stylePreferences && { stylePreferences: data.stylePreferences }),
                    },
                ]);

                if (data.showTypographyPicker) {
                    setShowTypographyPicker(true);
                    setRecommendedHeadingFont(data.recommendedHeadingFont ?? undefined);
                    setRecommendedBodyFont(data.recommendedBodyFont ?? undefined);
                }

                if (data.stylePreferences) {
                    console.log(
                        "[style-chat] Received stylePrefs update:",
                        data.stylePreferences,
                    );
                    setStylePreferences(
                        mergeStylePreferences(stylePreferences, data.stylePreferences),
                    );
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
            isReadyForInteraction,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
            addToast,
            requestStyleChat,
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

            setShowTypographyPicker(false);

            if (!activePortfolioId) return;

            setIsSendingStyle(true);
            try {
                const data = await requestStyleChat(
                    {
                        portfolioId: activePortfolioId,
                        fontSelections: { heading: fonts.heading, body: fonts.body },
                    },
                    "Font submission failed.",
                    "Typography update unavailable",
                );
                if (!data) return;

                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: data.assistantMessage,
                        timestamp: new Date(),
                        ...(data.suggestions && { suggestions: data.suggestions }),
                        ...(data.designTip && { designTip: data.designTip }),
                        ...(data.previewType && { previewType: data.previewType }),
                        ...(data.isComplete && { isStyleComplete: true }),
                        ...(data.isComplete && data.stylePreferences && { stylePreferences: data.stylePreferences }),
                    },
                ]);

                if (data.stylePreferences) {
                    setStylePreferences(
                        mergeStylePreferences(stylePreferences, data.stylePreferences),
                    );
                }
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
            isReadyForInteraction,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
            addToast,
            requestStyleChat,
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

                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: data.assistantMessage,
                        timestamp: new Date(),
                        ...(data.suggestions && { suggestions: data.suggestions }),
                        ...(data.designTip && { designTip: data.designTip }),
                        ...(data.previewType && { previewType: data.previewType }),
                        ...(data.isComplete && { isStyleComplete: true }),
                        ...(data.isComplete && data.stylePreferences && { stylePreferences: data.stylePreferences }),
                    },
                ]);

                if (data.stylePreferences) {
                    setStylePreferences(
                        mergeStylePreferences(stylePreferences, data.stylePreferences),
                    );
                }
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
            isReadyForInteraction,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
            addToast,
            requestStyleChat,
        ],
    );

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
