"use client";

import { useEffect, useRef } from "react";
import type { SectionDTO, GlobalTheme } from "@/types/portfolio";
import type { Message } from "@/types/preview";
import {
    createAiMessage,
    createGeneratingMessage,
    createUserMessage,
} from "../lib/message-helpers";

interface AssistantMessageResponse {
    summary?: string;
    suggestions?: string[];
}

interface GeneratePortfolioResponse {
    sections?: SectionDTO[] | null;
    globalTheme?: GlobalTheme | null;
    assistantMessage?: AssistantMessageResponse | null;
}

interface LoadPortfolioResponse {
    sections?: SectionDTO[] | null;
    globalTheme?: GlobalTheme | null;
}

interface UseInitialPortfolioGenerationParams {
    portfolioId: string | null;
    templateId: string | null;
    parsedResumeData: unknown;
    aiPrompt: string;
    stylePreferences: unknown;
    sections: SectionDTO[] | null;
    isHydrating: boolean;
    hasResolvedInitialPortfolioLoad: boolean;
    setSections: (sections: SectionDTO[] | null) => void;
    setGlobalTheme: (theme: GlobalTheme | null) => void;
    setMessages: (
        updater: Message[] | ((prev: Message[]) => Message[]),
    ) => void;
}

const DEFAULT_GENERATION_PROMPT =
    "Generate a visually appealing one-shot portfolio that reflects the parsed resume data and style preferences.";

export const useInitialPortfolioGeneration = ({
    portfolioId,
    templateId,
    parsedResumeData,
    aiPrompt,
    stylePreferences,
    sections,
    isHydrating,
    hasResolvedInitialPortfolioLoad,
    setSections,
    setGlobalTheme,
    setMessages,
}: UseInitialPortfolioGenerationParams): void => {
    const hasGeneratedRef = useRef<boolean>(false);

    useEffect((): void => {
        const loadSavedPortfolio = async (): Promise<boolean> => {
            if (!portfolioId) return false;

            try {
                console.log("[generate] Attempting to load saved portfolio data...");
                const loadResponse = await fetch(`/api/portfolio/${portfolioId}/load`);
                if (!loadResponse.ok) return false;

                const loadedData =
                    (await loadResponse.json()) as LoadPortfolioResponse;

                if ((loadedData.sections ?? []).length > 0) {
                    console.log(
                        "[generate] Successfully recovered portfolio with",
                        loadedData.sections?.length ?? 0,
                        "sections",
                    );
                    setSections(loadedData.sections ?? []);
                    if (loadedData.globalTheme) {
                        setGlobalTheme(loadedData.globalTheme);
                    }
                    return true;
                }

                return false;
            } catch {
                return false;
            }
        };

        const generate = async (): Promise<void> => {
            if (hasGeneratedRef.current) return;
            if (isHydrating || !hasResolvedInitialPortfolioLoad) return;
            if (sections && sections.length > 0) {
                hasGeneratedRef.current = true;
                return;
            }
            if (!portfolioId || !parsedResumeData) return;

            console.log("GENERATING...");
            hasGeneratedRef.current = true;

            const basePrompt = aiPrompt || DEFAULT_GENERATION_PROMPT;
            const userMessage: Message = {
                ...createUserMessage(basePrompt),
                id: `user-${Date.now()}`,
            };
            const tempAiMessage: Message = createGeneratingMessage("ai-temp");

            setMessages([userMessage, tempAiMessage]);

            try {
                console.log("[generate] Sending stylePrefs:", stylePreferences);
                const response = await fetch(`/api/portfolio/${portfolioId}/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        templateId,
                        resume: parsedResumeData,
                        userPrompt: basePrompt,
                        stylePrefs: stylePreferences,
                    }),
                });

                if (!response.ok) {
                    let errorData: unknown = null;

                    try {
                        errorData = await response.json();
                    } catch {
                        const errorText = await response.text();
                        errorData = {
                            error:
                                errorText.trim() ||
                                `Generate request failed with status ${response.status}`,
                            stage: "client_parse_error_response",
                        };
                    }

                    console.error("Generate API error:", errorData);
                    setMessages((prev) =>
                        prev.filter((message) => message.id !== tempAiMessage.id),
                    );
                    return;
                }

                const data = (await response.json()) as GeneratePortfolioResponse;

                setSections(data.sections ?? null);
                if (data.globalTheme) {
                    setGlobalTheme(data.globalTheme);
                }

                const summary = data.assistantMessage?.summary ?? "";
                const suggestions = data.assistantMessage?.suggestions ?? [];
                const formattedSuggestions = suggestions
                    .map((item: string) => `• ${item}`)
                    .join("\n");
                const content =
                    [summary, formattedSuggestions].filter(Boolean).join("\n").trim() ||
                    "Portfolio generated.";

                const aiMessage = createAiMessage(content, {
                    id: `ai-${Date.now()}`,
                    isGenerating: false,
                });

                setMessages((prev) =>
                    prev.filter((message) => message.id !== tempAiMessage.id).concat(aiMessage),
                );
            } catch (fetchError: unknown) {
                console.error("[generate] Fetch failed:", fetchError);
                console.log("[generate] Waiting 3s then attempting recovery...");

                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 3000);
                });

                const recovered = await loadSavedPortfolio();

                if (recovered) {
                    const recoveryMessage = createAiMessage(
                        "Portfolio generated successfully! (Connection timed out but data was recovered.)",
                        { isGenerating: false },
                    );
                    setMessages((prev) =>
                        prev
                            .filter((message) => message.id !== tempAiMessage.id)
                            .concat(recoveryMessage),
                    );
                    return;
                }

                const errorMessage = createAiMessage(
                    "Generation timed out and could not recover. Please try again.",
                    { isGenerating: false },
                );
                setMessages((prev) =>
                    prev
                        .filter((message) => message.id !== tempAiMessage.id)
                        .concat(errorMessage),
                );
            }
        };

        void generate();
    }, [
        portfolioId,
        templateId,
        parsedResumeData,
        aiPrompt,
        stylePreferences,
        sections,
        isHydrating,
        hasResolvedInitialPortfolioLoad,
        setSections,
        setGlobalTheme,
        setMessages,
    ]);
};
