"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProfileMeQuery } from "@/hooks/useProfileMeQuery";
import type {
    CompletedSectionsResponse,
    GlobalTheme,
    JobStatusResponse,
    SectionDTO,
} from "@/types/portfolio";
import type { Message } from "@/types/preview";
import {
    createAiMessage,
    createGeneratingMessage,
    createUserMessage,
} from "../lib/message-helpers";
import type { GenerationPhase } from "../components/loaders/GenerationOverlay";
import {
    useGenerationJobStore,
    type ActiveGenerationJob,
} from "@/stores/useGenerationJobStore";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import {
    GenerationPollingGuard,
    type GenerationPollingStopReason,
} from "@/lib/generation-polling";

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

const DEFAULT_GENERATION_PROMPT: string =
    "Generate a visually appealing one-shot portfolio that reflects the parsed resume data and style preferences.";

const POLL_INTERVAL_MS: number = 3000; // 3 seconds
const REFUND_REFRESH_DELAY_MS = 1_000;

const POLLING_FAILURE_MESSAGES: Record<GenerationPollingStopReason, string> = {
    TIMEOUT: "Generation did not finish in time. Check your saved portfolio before trying again.",
    AUTHORIZATION: "Your session expired while generation was running. Sign in again to check it.",
    MISSING: "Generation status expired before completion was confirmed. Check your saved portfolio before trying again.",
    UNAVAILABLE: "The generation service could not be reached. Check your saved portfolio before trying again.",
};

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
    appendSections,
    setGlobalTheme,
    setMessages,
}: UseInitialPortfolioGenerationParams): UseInitialPortfolioGenerationReturn => {
    const queryClient = useQueryClient();
    const hasGeneratedRef = useRef<boolean>(false);
    const sectionsRef = useRef(sections);
    const [generationPhase, setGenerationPhase] = useState<GenerationPhase | null>(null);
    const [totalSections, setTotalSections] = useState<number>(0);

    useEffect(() => {
        sectionsRef.current = sections;
    }, [sections]);

    useEffect(() => {
        let pollTimer: ReturnType<typeof setInterval> | null = null;
        let cancelled: boolean = false;
        const refreshBillingAfterRefund = (): void => {
            void invalidateProfileMeQuery(queryClient);
            setTimeout(
                () => void invalidateProfileMeQuery(queryClient),
                REFUND_REFRESH_DELAY_MS,
            );
        };

        // Fallback: load the full portfolio from DB (catches missed sections + global theme)
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

                    // Overwrite with the full set to catch any missed sections + correct ordering
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

        const pollJobStatus = (
            jobId: string,
            tempMessageId: string,
            initialOffset: number = 0,
            startedAt: number = Date.now(),
        ): void => {
            let sectionOffset = initialOffset;
            let pollInFlight = false;
            const guard = new GenerationPollingGuard(startedAt);

            const stopTimer = (): void => {
                if (pollTimer) clearInterval(pollTimer);
            };

            const finishSuccessfully = async (
                loadPortfolio: boolean = true,
            ): Promise<void> => {
                stopTimer();
                setGenerationPhase(null);
                useGenerationJobStore.getState().clearJob();
                if (loadPortfolio) await loadSavedPortfolio();

                const doneMessage: Message = createAiMessage(
                    "Portfolio generated successfully!",
                    {
                        id: `ai-${Date.now()}`,
                        isGenerating: false,
                    },
                );
                setMessages((prev) =>
                    prev
                        .filter((message) => message.id !== tempMessageId)
                        .concat(doneMessage),
                );
            };

            const finishWithFailure = (
                message: string,
                refreshRefund: boolean,
            ): void => {
                stopTimer();
                setGenerationPhase(null);
                useGenerationJobStore.getState().clearJob();
                if (refreshRefund) refreshBillingAfterRefund();

                const errorMessage: Message = createAiMessage(message, {
                    id: `ai-${Date.now()}`,
                    isGenerating: false,
                });
                setMessages((prev) =>
                    prev
                        .filter((item) => item.id !== tempMessageId)
                        .concat(errorMessage),
                );
            };

            const stopWithoutTerminalStatus = async (
                reason: GenerationPollingStopReason,
            ): Promise<void> => {
                stopTimer();
                const recovered =
                    reason !== "AUTHORIZATION" && (await loadSavedPortfolio());
                if (recovered) {
                    await finishSuccessfully(false);
                    return;
                }
                finishWithFailure(POLLING_FAILURE_MESSAGES[reason], false);
            };

            pollTimer = setInterval(async () => {
                if (cancelled) {
                    stopTimer();
                    return;
                }
                if (pollInFlight) return;

                const deadlineReason = guard.stopReason();
                if (deadlineReason) {
                    await stopWithoutTerminalStatus(deadlineReason);
                    return;
                }

                pollInFlight = true;
                try {
                    // Fetch completed sections since our last offset
                    const sectionsRes: Response = await fetch(
                        `/api/portfolio/jobs/${jobId}/sections?after=${sectionOffset}`,
                        { cache: "no-store" },
                    );

                    if (sectionsRes.ok) {
                        guard.recordResponse(sectionsRes.status);
                        const sectionsData =
                            (await sectionsRes.json()) as CompletedSectionsResponse;

                        // Append any new sections incrementally
                        if (sectionsData.sections.length > 0) {
                            appendSections(sectionsData.sections);
                            sectionOffset += sectionsData.sections.length;
                        }

                        // Update total sections count
                        if (sectionsData.totalSections > 0) {
                            setTotalSections(sectionsData.totalSections);
                        }

                        // Build progress label
                        const completedCount = sectionsData.completedCount;
                        const total = sectionsData.totalSections;
                        const statusLabel =
                            STATUS_LABELS[sectionsData.status] ??
                            sectionsData.status;
                        const progressLabel =
                            total > 0
                                ? `${statusLabel.replace("...", "")} (${completedCount}/${total})...`
                                : statusLabel;

                        // Update overlay phase
                        setGenerationPhase(sectionsData.status as GenerationPhase);

                        // Update throbber message
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === tempMessageId
                                    ? { ...m, content: progressLabel }
                                    : m,
                            ),
                        );

                        if (sectionsData.status === "COMPLETED") {
                            await finishSuccessfully();
                            return;
                        }

                        if (sectionsData.status === "FAILED") {
                            finishWithFailure(
                                "Generation failed. Please try again.",
                                true,
                            );
                            return;
                        }
                    } else {
                        // Fallback: fetch job status only
                        const statusRes: Response = await fetch(
                            `/api/portfolio/jobs/status/${jobId}`,
                            { cache: "no-store" },
                        );
                        const responseReason = guard.recordResponse(
                            statusRes.status,
                        );
                        if (responseReason) {
                            await stopWithoutTerminalStatus(responseReason);
                            return;
                        }
                        if (!statusRes.ok) return;

                        const jobStatus =
                            (await statusRes.json()) as JobStatusResponse;
                        const label: string =
                            STATUS_LABELS[jobStatus.status] ?? jobStatus.status;

                        setGenerationPhase(jobStatus.status as GenerationPhase);

                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === tempMessageId
                                    ? { ...m, content: label }
                                    : m,
                            ),
                        );

                        if (jobStatus.status === "COMPLETED") {
                            await finishSuccessfully();
                            return;
                        }

                        if (jobStatus.status === "FAILED") {
                            finishWithFailure(
                                "Generation failed. Please try again.",
                                true,
                            );
                            return;
                        }
                    }
                } catch (err) {
                    console.error("[poll] Status check failed: ", err);
                    const failureReason = guard.recordNetworkFailure();
                    if (failureReason) {
                        await stopWithoutTerminalStatus(failureReason);
                    }
                } finally {
                    pollInFlight = false;
                }
            }, POLL_INTERVAL_MS);
        };

        /*
         * Re-attaches to a generation job that is already running (page
         * re-entry or a fresh tab) instead of starting a new one. Sections
         * that already arrived stay in place; polling continues after them.
         */
        const resumeActiveJob = async (job: ActiveGenerationJob): Promise<void> => {
            hasGeneratedRef.current = true;

            // Job state expired in Redis (finished long ago): hydration already
            // loaded the final portfolio from the DB, so just drop the job
            try {
                const statusRes = await fetch(
                    `/api/portfolio/jobs/status/${job.jobId}`,
                    { cache: "no-store" },
                );
                if (statusRes.status === 404 || statusRes.status === 410) {
                    useGenerationJobStore.getState().clearJob();
                    return;
                }
            } catch {
                // Transient failure: attach anyway, the poller tolerates errors
            }

            console.log("[generate] Resuming active job:", job.jobId);
            const throbber: Message = createGeneratingMessage("ai-temp");
            setMessages((prev) =>
                prev.filter((m) => !m.isGenerating).concat(throbber),
            );
            setGenerationPhase("GENERATING");
            pollJobStatus(
                job.jobId,
                throbber.id,
                sectionsRef.current?.length ?? 0,
                job.startedAt,
            );
        };

        const generate = async (): Promise<void> => {
            if (hasGeneratedRef.current) return;
            if (isHydrating || !hasResolvedInitialPortfolioLoad) return;

            // --- An in-flight generation takes precedence over everything:
            // re-attach to it rather than starting (and paying for) a new one
            const activeJob = useGenerationJobStore.getState().activeJob;
            if (activeJob && activeJob.kind === "generate") {
                if (!portfolioId) {
                    // Fresh tab: seed the id and let the effect re-run with it
                    usePortfolioStore.getState().setPortfolioId(activeJob.portfolioId);
                    return;
                }
                await resumeActiveJob(activeJob);
                return;
            }

            if (sectionsRef.current && sectionsRef.current.length > 0) {
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
                void invalidateProfileMeQuery(queryClient);

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

                // Start polling for status + sections
                const { jobId } = (await response.json()) as { jobId: string };
                const startedAt = Date.now();
                useGenerationJobStore.getState().startJob({
                    jobId,
                    portfolioId,
                    kind: "generate",
                    startedAt,
                });
                pollJobStatus(jobId, tempAiMessage.id, 0, startedAt);
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
        isHydrating,
        hasResolvedInitialPortfolioLoad,
        setSections,
        appendSections,
        setGlobalTheme,
        setMessages,
        queryClient,
    ]);

    return { generationPhase, totalSections };
};
