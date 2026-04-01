"use client";

import { useEffect, useRef, useState } from "react";
import {
    applyMockRefinement,
    createMockPortfolioSnapshot,
} from "@/lib/mock-portfolios";
import type { GlobalTheme, SectionDTO } from "@/types/portfolio";
import type { Message } from "@/types/preview";
import {
    createAiMessage,
    createGeneratingMessage,
    createUserMessage,
} from "../lib/message-helpers";
import type { GenerationPhase } from "../components/loaders/GenerationOverlay";

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
    appendSections: (newSections: SectionDTO[]) => void;
    setGlobalTheme: (theme: GlobalTheme | null) => void;
    setMessages: (
        updater: Message[] | ((prev: Message[]) => Message[]),
    ) => void;
}

interface UseInitialPortfolioGenerationReturn {
    generationPhase: GenerationPhase | null;
    totalSections: number;
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
    appendSections,
    setGlobalTheme,
    setMessages,
}: UseInitialPortfolioGenerationParams): UseInitialPortfolioGenerationReturn => {
    const hasGeneratedRef = useRef<boolean>(false);
    const [generationPhase, setGenerationPhase] =
        useState<GenerationPhase | null>(null);
    const [totalSections, setTotalSections] = useState<number>(0);

    useEffect(() => {
        let cancelled = false;

        const generate = async (): Promise<void> => {
            if (hasGeneratedRef.current) return;
            if (isHydrating || !hasResolvedInitialPortfolioLoad) return;
            if (sections && sections.length > 0) {
                hasGeneratedRef.current = true;
                return;
            }
            if (!portfolioId || !parsedResumeData) return;

            hasGeneratedRef.current = true;

            const basePrompt = aiPrompt || DEFAULT_GENERATION_PROMPT;
            const userMessage: Message = {
                ...createUserMessage(basePrompt),
                id: `user-${Date.now()}`,
            };
            const tempAiMessage: Message = createGeneratingMessage("ai-temp");

            setMessages([userMessage, tempAiMessage]);
            setGenerationPhase("QUEUED");

            try {
                void stylePreferences;

                await new Promise((resolve) => window.setTimeout(resolve, 450));
                if (cancelled) return;

                setGenerationPhase("PROCESSING");
                const snapshot = createMockPortfolioSnapshot({
                    portfolioId,
                    templateId,
                    prompt: basePrompt,
                });

                await new Promise((resolve) => window.setTimeout(resolve, 350));
                if (cancelled) return;

                const refined = applyMockRefinement({
                    sections: snapshot.sections,
                    prompt: basePrompt,
                });

                setGenerationPhase("GENERATING");
                setTotalSections(refined.sections.length);
                setSections([]);

                await new Promise((resolve) => window.setTimeout(resolve, 300));
                if (cancelled) return;

                appendSections(refined.sections);
                setGlobalTheme(refined.globalTheme);
                setGenerationPhase(null);

                const doneMessage = createAiMessage(
                    "Mock portfolio generated locally. Backend portfolio generation has been removed from this flow.",
                    {
                        id: `ai-${Date.now()}`,
                        isGenerating: false,
                    },
                );

                setMessages((prev) =>
                    prev.filter((m) => m.id !== tempAiMessage.id).concat(doneMessage),
                );
            } catch (err: unknown) {
                console.error("[generate] Failed to build mock portfolio:", err);
                const errorMsg = createAiMessage(
                    "Failed to generate the local mock portfolio. Please try again.",
                    { isGenerating: false },
                );
                setMessages((prev) =>
                    prev.filter((m) => m.id !== tempAiMessage.id).concat(errorMsg),
                );
                setGenerationPhase(null);
            }
        };

        void generate();

        return () => {
            cancelled = true;
        };
    }, [
        aiPrompt,
        appendSections,
        hasResolvedInitialPortfolioLoad,
        isHydrating,
        parsedResumeData,
        portfolioId,
        sections,
        setGlobalTheme,
        setMessages,
        setSections,
        stylePreferences,
        templateId,
    ]);

    return { generationPhase, totalSections };
};
