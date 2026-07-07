import { isStyleChatHistory, toUiStyleMessages } from "@/lib/style-chat-history";
import type { Message } from "@/types/preview";
import type {
    ColorPresetColors,
    ColorPresetRecommendation,
    StyleChatResponse,
    StylePreferences,
} from "@/types/style";
import type {
    InitialStyleChatHistoryState,
    PersistedStyleChatMessage,
} from "@/types/style-chat";

const INSUFFICIENT_CREDITS_CODE = "INSUFFICIENT_CREDITS";

export const DEFAULT_TEMPLATE_ID = "blank";
export const STYLE_CHAT_SYNC_DEBOUNCE_MS = 800;

export type StyleChatRequestFailure = {
    code?: string;
    message: string;
    status: number;
};

export interface StyleChatPanelState {
    recommendedBodyFont: string | undefined;
    recommendedColorPresets: ColorPresetRecommendation[];
    recommendedHeadingFont: string | undefined;
    showColorPicker: boolean;
    showTypographyPicker: boolean;
}

type StyleChatErrorPayload = {
    code?: string;
    error?: string;
    message?: string;
};

export const createIntroStyleMessage = (): Message => ({
    id: "style-assistant-intro",
    role: "ai",
    content:
        "Hey! I'm your design consultant. Tell me about your vision - what's the overall theme or goal for your portfolio? For example: 'clean minimalist developer portfolio' or 'bold creative agency showcase'.",
    timestamp: new Date(),
});

export const toInitialStyleMessages = (
    history: PersistedStyleChatMessage[] | null | undefined,
): Message[] => {
    if (isStyleChatHistory(history) && history.length > 0) {
        return toUiStyleMessages(history);
    }

    return [createIntroStyleMessage()];
};

export const normalizeInitialStyleChatHistory = (
    value: unknown,
): InitialStyleChatHistoryState => {
    const unresolved = { history: null, isResolved: false };

    if (!value || typeof value !== "object") {
        return unresolved;
    }

    const payload = value as Record<string, unknown>;
    if (payload.isResolved !== true) {
        return unresolved;
    }

    if (!("history" in payload)) {
        return unresolved;
    }

    if (payload.history === null) {
        return { history: null, isResolved: true };
    }

    if (!isStyleChatHistory(payload.history)) {
        return unresolved;
    }

    return {
        history: payload.history,
        isResolved: true,
    };
};

export const toAssistantStyleMessage = (data: StyleChatResponse): Message => ({
    id: `ai-${Date.now()}`,
    role: "ai",
    content: data.assistantMessage,
    timestamp: new Date(),
    ...(data.suggestions && { suggestions: data.suggestions }),
    ...(data.designTip && { designTip: data.designTip }),
    ...(data.previewType && { previewType: data.previewType }),
    ...(data.isComplete && { isStyleComplete: true }),
    ...(data.isComplete &&
        data.stylePreferences && { stylePreferences: data.stylePreferences }),
    ...(data.isComplete &&
        data.updatedStyleFields?.length && {
            updatedStyleFields: data.updatedStyleFields,
        }),
    ...(data.showColorPicker && {
        showColorPicker: true,
        recommendedColorPresets: normalizeRecommendedPresets(
            data.recommendedColorPresets,
        ),
    }),
    ...(data.showTypographyPicker && {
        showTypographyPicker: true,
        ...(data.recommendedHeadingFont && {
            recommendedHeadingFont: data.recommendedHeadingFont,
        }),
        ...(data.recommendedBodyFont && {
            recommendedBodyFont: data.recommendedBodyFont,
        }),
    }),
});

export const parseStyleChatFailure = async (
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

export const isInsufficientCreditsFailure = (
    failure: StyleChatRequestFailure,
): boolean =>
    failure.status === 402 || failure.code === INSUFFICIENT_CREDITS_CODE;

export const mergeStylePreferences = (
    current: StylePreferences,
    incoming: Partial<StylePreferences>,
): StylePreferences => ({
    colorScheme: incoming.colorScheme ?? current.colorScheme,
    layoutDensity: incoming.layoutDensity ?? current.layoutDensity,
    tone: incoming.tone ?? current.tone,
    visualStyle: incoming.visualStyle ?? current.visualStyle,
    sectionEmphasis: incoming.sectionEmphasis ?? current.sectionEmphasis,
    typography: incoming.typography ?? current.typography,
    animationStyle: incoming.animationStyle ?? current.animationStyle,
    whitespace: incoming.whitespace ?? current.whitespace,
    imageryStyle: incoming.imageryStyle ?? current.imageryStyle,
    interactiveElements:
        incoming.interactiveElements ?? current.interactiveElements,
    customNotes: incoming.customNotes?.trim() || current.customNotes,
});

export const normalizeRecommendedPresets = (
    value: unknown,
): ColorPresetRecommendation[] => {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const normalized: ColorPresetRecommendation[] = [];

    const parseColors = (colors: unknown): ColorPresetColors | null => {
        if (!colors || typeof colors !== "object") return null;
        const colorMap = colors as Record<string, unknown>;

        const primary =
            typeof colorMap.primary === "string" ? colorMap.primary.trim() : "";
        const secondary =
            typeof colorMap.secondary === "string"
                ? colorMap.secondary.trim()
                : "";
        const accent =
            typeof colorMap.accent === "string" ? colorMap.accent.trim() : "";
        const background =
            typeof colorMap.background === "string"
                ? colorMap.background.trim()
                : "";
        const text = typeof colorMap.text === "string" ? colorMap.text.trim() : "";
        const muted =
            typeof colorMap.muted === "string" ? colorMap.muted.trim() : "";

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
};

export const deriveStyleChatPanelState = (
    messages: Message[],
): StyleChatPanelState => {
    const lastMessage = messages.at(-1);
    if (!lastMessage || lastMessage.role !== "ai") {
        return {
            recommendedBodyFont: undefined,
            recommendedColorPresets: [],
            recommendedHeadingFont: undefined,
            showColorPicker: false,
            showTypographyPicker: false,
        };
    }

    return {
        recommendedBodyFont: lastMessage.showTypographyPicker
            ? lastMessage.recommendedBodyFont
            : undefined,
        recommendedColorPresets: lastMessage.showColorPicker
            ? normalizeRecommendedPresets(lastMessage.recommendedColorPresets)
            : [],
        recommendedHeadingFont: lastMessage.showTypographyPicker
            ? lastMessage.recommendedHeadingFont
            : undefined,
        showColorPicker: Boolean(lastMessage.showColorPicker),
        showTypographyPicker: Boolean(lastMessage.showTypographyPicker),
    };
};
