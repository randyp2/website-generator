"use client";

import { useEffect, useRef, useState } from "react";
import type {
    JobStatusResponse,
    SectionDTO,
    GlobalTheme,
} from "@/types/portfolio";
import type { Message } from "@/types/preview";
import {
    createAiMessage,
    createGeneratingMessage,
    createUserMessage,
} from "../lib/message-helpers";

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

const DEFAULT_GENERATION_PROMPT: string =
    "Generate a visually appealing one-shot portfolio that reflects the parsed resume data and style preferences.";

const POLL_INTERVAL_MS: number = 3000; // 3 seconds

const STATUS_LABELS: Record<string, string> = {
    QUEUED: "Queued...",
    PROCESSING: "Processing...",
    REFINING_PROMPT: "Refining your prompt...",
    GENERATING: "Generating...",
    VALIDATING: "Validating...",
    RETRYING: "Retrying...",
    PERSISTING: "Persisting...",
};

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
}: UseInitialPortfolioGenerationParams): { generationPhase: string | null } => {
    const hasGeneratedRef = useRef<boolean>(false);
    const [generationPhase, setGenerationPhase] = useState<string | null>(null);

    useEffect(() => {
        let pollTimer: ReturnType<typeof setInterval> | null = null;
        let cancelled: boolean = false;

        // Used more so as a fall back in the case that one-shot generation fails
        // - If frontend end fetch fails fall back to this
        // - Server side might've succeeded
        const loadSavedPortfolio = async (): Promise<boolean> => {
            if (!portfolioId) return false;

            try {
                console.log(
                    "[generate] Attempting to load saved portfolio data...",
                );
                const loadResponse = await fetch(
                    `/api/portfolio/${portfolioId}/load`,
                );
                if (!loadResponse.ok) return false;

                const loadedData =
                    (await loadResponse.json()) as LoadPortfolioResponse;

                if ((loadedData.sections ?? []).length > 0) {
                    console.log(
                        "[generate] Successfully recovered portfolio with",
                        loadedData.sections?.length ?? 0,
                        "sections",
                    );

                    // Persist to zustand
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

        const pollJobStatus = (jobId: string, tempMessageId: string): void => {
            pollTimer = setInterval(async () => {
                if (cancelled) {
                    if (pollTimer) clearInterval(pollTimer);
                    return;
                }

                try {
                    // Fetch the current jobs status
                    const res: Response = await fetch(
                        `/api/portfolio/jobs/status/${jobId}`,
                    );
                    if (!res.ok) return;

                    const job_status = (await res.json()) as JobStatusResponse;
                    const label: string =
                        STATUS_LABELS[job_status.status] ?? job_status.status;

                    // Update overlay phase
                    setGenerationPhase(job_status.status);

                    // Update throbber message
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === tempMessageId
                                ? { ...m, content: label }
                                : m,
                        ),
                    );

                    if (job_status.status === "COMPLETED") {
                        // Clear the time interval
                        if (pollTimer) clearInterval(pollTimer);
                        setGenerationPhase(null);

                        // Load from DB
                        await loadSavedPortfolio();

                        const done_message: Message = createAiMessage(
                            "Portfolio generated successfully!",
                            { id: `ai-${Date.now()}`, isGenerating: false },
                        );

                        setMessages((prev) =>
                            prev
                                .filter((m) => m.id !== tempMessageId)
                                .concat(done_message),
                        );
                    }

                    if (job_status.status === "FAILED") {
                        if (pollTimer) clearInterval(pollTimer);
                        setGenerationPhase(null);

                        const error_message: Message = createAiMessage(
                            "Generation failed. Please try again.",
                            { id: `ai-${Date.now()}`, isGenerating: false },
                        );

                        setMessages((prev) =>
                            prev
                                .filter((m) => m.id !== tempMessageId)
                                .concat(error_message),
                        );
                    }
                } catch (err) {
                    console.error("[poll] Status check failed: ", err);
                }
            }, POLL_INTERVAL_MS);
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
            setGenerationPhase("QUEUED");

            try {
                console.log("[generate] Sending stylePrefs:", stylePreferences);
                const response = await fetch(
                    `/api/portfolio/${portfolioId}/generate`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            templateId,
                            resume: parsedResumeData,
                            userPrompt: basePrompt,
                            stylePrefs: stylePreferences,
                        }),
                    },
                );

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
                        prev.filter(
                            (message) => message.id !== tempAiMessage.id,
                        ),
                    );
                    return;
                }

                // Start polling for status
                const { jobId } = (await response.json()) as { jobId: string };
                pollJobStatus(jobId, tempAiMessage.id);
            } catch (err: unknown) {
                console.error("[generate] Failed to start generation:", err);
                const errorMsg = createAiMessage(
                    "Failed to start generation. Please try again.",
                    { isGenerating: false },
                );
                setMessages((prev) =>
                    prev
                        .filter((m) => m.id !== tempAiMessage.id)
                        .concat(errorMsg),
                );
            }
        };

        void generate();

        return () => {
            cancelled = true;
            if (pollTimer) clearInterval(pollTimer);
        };
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

    return { generationPhase };
};
