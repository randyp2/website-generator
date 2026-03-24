import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type {
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

const introStyleMessage: Message = {
    id: "style-assistant-intro",
    role: "ai",
    content:
        "Hey! I'm your design consultant. Tell me about your vision — what's the overall theme or goal for your portfolio? For example: 'clean minimalist developer portfolio' or 'bold creative agency showcase'.",
    timestamp: new Date(),
};

const STYLE_CHAT_SYNC_DEBOUNCE_MS = 800;

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
    const requiredColorKeys = [
        "primary",
        "secondary",
        "accent",
        "background",
        "text",
        "muted",
    ] as const;

    for (const item of value) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const name = typeof row.name === "string" ? row.name.trim() : "";
        const description =
            typeof row.description === "string"
                ? row.description.trim()
                : "Custom AI-generated palette.";
        const colors = row.colors;
        if (!name || !colors || typeof colors !== "object") continue;
        const colorMap = colors as Record<string, unknown>;
        const normalizedColors: Record<string, string> = {};
        let valid = true;
        for (const key of requiredColorKeys) {
            const raw = colorMap[key];
            if (typeof raw !== "string" || !raw.trim()) {
                valid = false;
                break;
            }
            normalizedColors[key] = raw.trim();
        }
        if (!valid) continue;

        const dedupeKey = name.toLowerCase();
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        normalized.push({
            name,
            description,
            colors: normalizedColors as ColorPresetRecommendation["colors"],
        });
        if (normalized.length >= 3) break;
    }

    return normalized;
}

export function useStyleChat(params: {
    portfolioId: string | null;
    templateId: string | null;
}) {
    const { portfolioId, templateId } = params;

    const {
        setTemplateId,
        setPortfolioId,
        styleMessages,
        stylePreferences,
        setStyleMessages,
        setStylePreferences,
        isSendingStyle,
        setIsSendingStyle,
    } = usePortfolioStore();

    const [isHydrated, setIsHydrated] = useState(false);
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [recommendedColorPresets, setRecommendedColorPresets] = useState<ColorPresetRecommendation[]>([]);
    const [showTypographyPicker, setShowTypographyPicker] = useState(false);
    const [recommendedHeadingFont, setRecommendedHeadingFont] = useState<string | undefined>();
    const [recommendedBodyFont, setRecommendedBodyFont] = useState<string | undefined>();
    const styleSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSyncedHistoryRef = useRef<string>("");

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

    // Effect 2: Load chat history from DB
    useEffect(() => {
        if (!isHydrated) return;

        let cancelled = false;
        setHasLoadedHistory(false);
        lastSyncedHistoryRef.current = "";

        const loadHistory = async () => {
            if (!portfolioId) {
                setShowColorPicker(false);
                setRecommendedColorPresets([]);
                setStyleMessages([introStyleMessage]);
                setHasLoadedHistory(true);
                return;
            }

            try {
                const res = await fetch(`/api/portfolio/${portfolioId}/get`);
                const data = res.ok ? await res.json() : null;
                const rawHistory = data?.portfolio?.style_chat_history;

                if (cancelled) return;

                if (isStyleChatHistory(rawHistory) && rawHistory.length > 0) {
                    lastSyncedHistoryRef.current = JSON.stringify(rawHistory);
                    setStyleMessages(toUiStyleMessages(rawHistory));
                } else {
                    setShowColorPicker(false);
                    setRecommendedColorPresets([]);
                    setStyleMessages([introStyleMessage]);
                }
            } catch {
                if (cancelled) return;
                setShowColorPicker(false);
                setRecommendedColorPresets([]);
                setStyleMessages([introStyleMessage]);
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
    }, [isHydrated, portfolioId, setStyleMessages]);

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

    // Effect 3: Sync templateId/portfolioId to store
    useEffect(() => {
        if (templateId) {
            setTemplateId(templateId);
        }
        if (portfolioId) {
            setPortfolioId(portfolioId);
        }
    }, [portfolioId, setPortfolioId, setTemplateId, templateId]);

    // Effect 4: Patch last_step to DB
    useEffect(() => {
        if (!portfolioId) return;
        fetch(`/api/portfolio/${portfolioId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "style" }),
        }).catch(() => null);
    }, [portfolioId]);

    // Sync helper
    const syncStyleHistoryToDb = useCallback(
        async (serializedHistory: string) => {
            if (!portfolioId) return;

            const parsedHistory = JSON.parse(
                serializedHistory,
            ) as PersistedStyleChatMessage[];

            const res = await fetch(`/api/portfolio/${portfolioId}/update`, {
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
        [portfolioId],
    );

    const flushStyleHistorySync = useCallback(async () => {
        if (!isHydrated || !portfolioId || !hasLoadedHistory) return;

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
        portfolioId,
        styleMessages,
        syncStyleHistoryToDb,
    ]);

    // Effect 5: Debounced styleMessages sync to DB
    useEffect(() => {
        if (!isHydrated || !portfolioId || !hasLoadedHistory) return;

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
        portfolioId,
        styleMessages,
        syncStyleHistoryToDb,
    ]);

    const handleSend = useCallback(
        async (prompt: string) => {
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

            if (!portfolioId) return;

            setIsSendingStyle(true);
            try {
                console.log(
                    "[style-chat] Sending message with stylePrefs:",
                    stylePreferences,
                );
                const res = await fetch("/api/portfolio/style-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ portfolioId, userMessage: prompt }),
                });

                if (!res.ok) {
                    throw new Error("Style chat request failed");
                }

                const data: StyleChatResponse = await res.json();

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
                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "ai",
                        content:
                            "Sorry, something went wrong. Please try sending your message again.",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            portfolioId,
            styleMessages,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
        ],
    );

    const handleColorSubmit = useCallback(
        async (colors: Record<string, string>) => {
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

            if (!portfolioId) return;

            setIsSendingStyle(true);
            try {
                console.log(
                    "[style-chat] Submitting colors with stylePrefs:",
                    stylePreferences,
                );
                const res = await fetch("/api/portfolio/style-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        portfolioId,
                        colorSelections: colors,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Color submission failed");
                }

                const data: StyleChatResponse = await res.json();

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
                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "ai",
                        content:
                            "Sorry, something went wrong submitting your colors. Please try again.",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            portfolioId,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
        ],
    );

    const handleFontSubmit = useCallback(
        async (fonts: { heading: string; body: string }) => {
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

            if (!portfolioId) return;

            setIsSendingStyle(true);
            try {
                const res = await fetch("/api/portfolio/style-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        portfolioId,
                        fontSelections: { heading: fonts.heading, body: fonts.body },
                    }),
                });

                if (!res.ok) {
                    throw new Error("Font submission failed");
                }

                const data: StyleChatResponse = await res.json();

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
                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "ai",
                        content: "Sorry, something went wrong submitting your fonts. Please try again.",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            portfolioId,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
        ],
    );

    const handleLayoutSubmit = useCallback(
        async (layoutName: string) => {
            setStyleMessages((prev) => [
                ...prev,
                {
                    id: `user-layout-${Date.now()}`,
                    role: "user",
                    content: `Selected layout: ${layoutName}`,
                    timestamp: new Date(),
                },
            ]);

            if (!portfolioId) return;

            setIsSendingStyle(true);
            try {
                const res = await fetch("/api/portfolio/style-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        portfolioId,
                        layoutSelection: layoutName,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Layout submission failed");
                }

                const data: StyleChatResponse = await res.json();

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
                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "ai",
                        content: "Sorry, something went wrong submitting your layout choice. Please try again.",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            portfolioId,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
        ],
    );

    return {
        normalizedStyleMessages,
        isSending: isSendingStyle,
        showColorPicker,
        recommendedColorPresets,
        showTypographyPicker,
        recommendedHeadingFont,
        recommendedBodyFont,
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        handleLayoutSubmit,
        flushStyleHistorySync,
    };
}
