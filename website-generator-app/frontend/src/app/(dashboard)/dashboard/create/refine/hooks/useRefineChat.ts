"use client";

import { useEffect, useRef, useState } from "react";
import type {
    CompletedSectionsResponse,
    GlobalTheme,
    SectionDTO,
} from "@/types/portfolio";
import type { Message, SectionPlan } from "@/types/preview";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { useGenerationJobStore } from "@/stores/useGenerationJobStore";
import { buildSectionSummaries } from "../lib/section-serializers";
import {
    createAiMessage,
    createGeneratingMessage,
    createUserMessage,
} from "../lib/message-helpers";

interface UseRefineChatParams {
    portfolioId: string | null;
    sections: SectionDTO[] | null;
    mediaFilesCount: number;
    videoFilesCount: number;
    setSections: (sections: SectionDTO[] | null) => void;
    setGlobalTheme: (theme: GlobalTheme | null) => void;
    setMessages: (
        updater: Message[] | ((prev: Message[]) => Message[]),
    ) => void;
    removeMediaFile: (index: number) => void;
    removeVideoFile: (index: number) => void;
}

interface PlannerResponse {
    planSummary: string;
    sectionPlans: SectionPlan[];
}

interface BuilderResponse {
    jobId: string;
}

interface ClarifyResponse {
    assistantMessage?: string;
    sessionId?: string;
    readyForPlanning?: boolean;
    error?: string;
}

interface LoadPortfolioResponse {
    sections?: SectionDTO[] | null;
    globalTheme?: GlobalTheme | null;
}

interface UseRefineChatResult {
    isGenerating: boolean;
    currentPlan: SectionPlan[] | null;
    isPlanApproved: boolean;
    sendMessage: (prompt: string, files: File[]) => Promise<void>;
    handleApprovePlan: () => Promise<void>;
    handleKeepChatting: () => void;
}

const POLL_INTERVAL_MS = 3000;

/** Raised when the backend reports the clarifier session expired (HTTP 410). */
class RefineSessionExpiredError extends Error {
    constructor() {
        super(
            "Your revision session expired, so I couldn't apply that. Please restate your request.",
        );
    }
}

/** Raised when the approved plan no longer matches the saved portfolio (HTTP 409). */
class RefinePlanConflictError extends Error {
    constructor() {
        super(
            "The portfolio changed since this plan was made, so I couldn't apply it. Please request the change again.",
        );
    }
}

const STATUS_LABELS: Record<string, string> = {
    QUEUED: "Queued...",
    PROCESSING: "Processing...",
    GENERATING: "Generating sections...",
    PERSISTING: "Saving changes...",
};

export const useRefineChat = ({
    portfolioId,
    sections,
    mediaFilesCount,
    videoFilesCount,
    setSections,
    setGlobalTheme,
    setMessages,
    removeMediaFile,
    removeVideoFile,
}: UseRefineChatParams): UseRefineChatResult => {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [currentPlan, setCurrentPlan] = useState<SectionPlan[] | null>(null);
    const [isPlanApproved, setIsPlanApproved] = useState<boolean>(false);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasResumedRef = useRef(false);

    // Session id lives in the persisted store so a page refresh mid-conversation
    // keeps the clarifier context. Read via getState() to avoid stale closures.
    const getSessionId = (): string | null =>
        usePortfolioStore.getState().refineSessionId;
    const setSessionId = (sessionId: string | null): void =>
        usePortfolioStore.getState().setRefineSessionId(sessionId);

    /**
     * Request a modification plan. Sends only the session id: the backend
     * plans against sections loaded from the DB, never client state.
     */
    const callPlanner = async (): Promise<PlannerResponse | null> => {
        if (!portfolioId) return null;

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: getSessionId(),
            }),
        });

        if (!response.ok) {
            if (response.status === 410) {
                setSessionId(null);
                throw new RefineSessionExpiredError();
            }
            const error = (await response.json()) as { error?: string };
            throw new Error(error.error ?? "Plan request failed");
        }

        return (await response.json()) as PlannerResponse;
    };

    /**
     * Kick off the build — returns a jobId for polling.
     * Sends only plans and the session id: the backend loads section code
     * from the DB, so client state can never overwrite newer saved sections.
     */
    const callBuilder = async (
        sectionPlans: SectionPlan[],
    ): Promise<BuilderResponse | null> => {
        if (!portfolioId) return null;

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/build`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: getSessionId(),
                sectionPlans,
            }),
        });

        if (!response.ok) {
            if (response.status === 410) {
                setSessionId(null);
                throw new RefineSessionExpiredError();
            }
            if (response.status === 409) {
                throw new RefinePlanConflictError();
            }
            const error = (await response.json()) as { error?: string };
            throw new Error(error.error ?? "Build request failed");
        }

        return (await response.json()) as BuilderResponse;
    };

    /**
     * Load the full portfolio from DB after generation completes.
     * Catches any sections missed during incremental polling and syncs globalTheme.
     */
    const loadSavedPortfolio = async (): Promise<void> => {
        if (!portfolioId) return;

        try {
            const res = await fetch(`/api/portfolio/${portfolioId}/load`);
            if (!res.ok) return;

            const data = (await res.json()) as LoadPortfolioResponse;

            if ((data.sections ?? []).length > 0) {
                setSections(data.sections ?? []);
            }
            if (data.globalTheme) {
                setGlobalTheme(data.globalTheme);
            }
        } catch {
            // Best-effort — sections were already set incrementally
        }
    };

    /**
     * Poll the job's section endpoint for incremental progress.
     * Same pattern used by useInitialPortfolioGeneration.
     */
    const pollBuildJob = (jobId: string, buildingMessageId: string): void => {
        let sectionOffset = 0;
        // Sections whose refinement failed and kept their previous version
        const fallbackSectionNames: string[] = [];

        pollTimerRef.current = setInterval(async () => {
            try {
                const res = await fetch(
                    `/api/portfolio/jobs/${jobId}/sections?after=${sectionOffset}`,
                );

                if (!res.ok) return;

                const data = (await res.json()) as CompletedSectionsResponse;

                // Append any new sections incrementally
                if (data.sections.length > 0) {
                    sectionOffset += data.sections.length;

                    for (const section of data.sections) {
                        if (section.refineFallback) {
                            fallbackSectionNames.push(
                                section.title || section.sectionKey,
                            );
                        }
                    }

                    // Merge new/modified sections into existing sections
                    setSections(mergeSections(sections, data.sections));
                }

                // Update progress message
                const statusLabel =
                    STATUS_LABELS[data.status] ?? data.status;
                const progressLabel =
                    data.totalSections > 0
                        ? `${statusLabel.replace("...", "")} (${data.completedCount}/${data.totalSections})...`
                        : statusLabel;

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === buildingMessageId
                            ? { ...m, content: progressLabel }
                            : m,
                    ),
                );

                if (data.status === "COMPLETED") {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    useGenerationJobStore.getState().clearJob();

                    // Final load to get the fully merged portfolio from DB
                    await loadSavedPortfolio();

                    const completionText =
                        fallbackSectionNames.length > 0
                            ? `Portfolio updated, but I couldn't apply the change to ${fallbackSectionNames.join(
                                  ", ",
                              )}, so ${fallbackSectionNames.length === 1 ? "that section was" : "those sections were"} left unchanged. Try rephrasing that request.`
                            : "Portfolio updated successfully!";

                    const completeMessage: Message = createAiMessage(
                        completionText,
                        {
                            id: `ai-complete-${Date.now()}`,
                            messageType: "build",
                        },
                    );

                    setMessages((prev) =>
                        prev
                            .filter((m) => m.id !== buildingMessageId)
                            .concat(completeMessage),
                    );

                    setCurrentPlan(null);
                    setIsGenerating(false);
                    setIsPlanApproved(false);
                    // Clear session so next refinement starts fresh
                    setSessionId(null);
                }

                if (data.status === "FAILED") {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    useGenerationJobStore.getState().clearJob();

                    const errorMessage: Message = createAiMessage(
                        "Sorry, there was an error building your changes. Please try again.",
                        {
                            id: `ai-error-${Date.now()}`,
                            messageType: "error",
                        },
                    );

                    setMessages((prev) =>
                        prev
                            .filter((m) => m.id !== buildingMessageId)
                            .concat(errorMessage),
                    );

                    setIsGenerating(false);
                    setIsPlanApproved(false);
                }
            } catch (err) {
                console.error("[refine-poll] Status check failed:", err);
            }
        }, POLL_INTERVAL_MS);
    };

    const approvePlanAndBuild = async (): Promise<void> => {
        if (!currentPlan || currentPlan.length === 0) return;

        setIsGenerating(true);

        const buildingMessage: Message = createGeneratingMessage("ai-building", {
            content: "Building your refined portfolio...",
            messageType: "build",
        });
        setMessages((prev) => [...prev, buildingMessage]);

        try {
            const buildResult = await callBuilder(currentPlan);

            if (!buildResult?.jobId) {
                throw new Error("No jobId returned from build endpoint");
            }

            if (portfolioId) {
                useGenerationJobStore.getState().startJob({
                    jobId: buildResult.jobId,
                    portfolioId,
                    kind: "refine",
                });
            }

            // Start polling for incremental section updates
            pollBuildJob(buildResult.jobId, buildingMessage.id);
        } catch (error: unknown) {
            console.error("Build error:", error);
            setIsPlanApproved(false);
            // A conflicting plan is unusable: drop it so the user re-plans
            if (error instanceof RefinePlanConflictError) {
                setCurrentPlan(null);
            }
            const errorMessage: Message = createAiMessage(
                error instanceof RefineSessionExpiredError ||
                    error instanceof RefinePlanConflictError
                    ? error.message
                    : "Sorry, there was an error building your changes. Please try again.",
                {
                    id: `ai-error-${Date.now()}`,
                    messageType: "error",
                },
            );
            setMessages((prev) =>
                prev
                    .filter((message) => message.id !== buildingMessage.id)
                    .concat(errorMessage),
            );
            setIsGenerating(false);
            setIsPlanApproved(false);
        }
    };

    const sendMessage = async (prompt: string, files: File[]): Promise<void> => {
        if (!prompt.trim() && files.length === 0) return;

        const isApproval = prompt.trim().toLowerCase() === "approve" && currentPlan;
        if (isApproval) {
            const approvalMessage: Message = createUserMessage("approve");
            setMessages((prev) => [...prev, approvalMessage]);
            await approvePlanAndBuild();
            return;
        }

        if (!portfolioId) {
            const errorMessage: Message = {
                ...createAiMessage(
                    "Please create a portfolio first so I can refine its sections.",
                ),
                id: (Date.now() + 1).toString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            return;
        }

        const userMessage: Message = createUserMessage(prompt);
        const tempAiMessage: Message = createGeneratingMessage("ai-temp");

        setMessages((prev) => [...prev, userMessage, tempAiMessage]);

        for (let index = 0; index < mediaFilesCount; index += 1) {
            removeMediaFile(0);
        }
        for (let index = 0; index < videoFilesCount; index += 1) {
            removeVideoFile(0);
        }

        setIsGenerating(true);

        if (currentPlan) {
            setCurrentPlan(null);
        }

        try {
            const response = await fetch(`/api/portfolio/${portfolioId}/refine/clarify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userPrompt: prompt,
                    sessionId: getSessionId(),
                    sections: buildSectionSummaries(sections),
                }),
            });

            const data = (await response.json()) as ClarifyResponse;

            // Store the sessionId returned by the backend (minted on first call)
            if (data.sessionId) {
                setSessionId(data.sessionId);
            }

            if (!response.ok) {
                throw new Error(data.error ?? "Clarification request failed.");
            }

            const aiResponseText =
                data.assistantMessage ??
                "Thanks! I can help clarify that. What would you like to change?";
            const isReadyForPlanning = data.readyForPlanning === true;

            const clarifyMessage: Message = {
                ...createAiMessage(aiResponseText, {
                    messageType: "clarify",
                    readyForPlanning: isReadyForPlanning,
                }),
                id: (Date.now() + 1).toString(),
            };

            setMessages((prev) =>
                prev
                    .filter((message) => message.id !== tempAiMessage.id)
                    .concat(clarifyMessage),
            );

            if (isReadyForPlanning) {
                const planningMessage: Message = createGeneratingMessage(
                    "ai-planning",
                    {
                        content: "Creating a modification plan...",
                        messageType: "plan",
                    },
                );
                setMessages((prev) => [...prev, planningMessage]);

                try {
                    const planResult = await callPlanner();

                    if (planResult?.sectionPlans) {
                        setCurrentPlan(planResult.sectionPlans);
                        setIsPlanApproved(false);

                        const planDetails = planResult.sectionPlans
                            .filter(
                                (plan) =>
                                    plan.action === "modify" || plan.action === "add",
                            )
                            .map((plan) => `• ${plan.sectionKey}: ${plan.instruction}`)
                            .join("\n");

                        const planContent = `${planResult.planSummary}\n\n**Planned Changes:**\n${planDetails}\n\n_Use the buttons below to apply these changes, or keep chatting to adjust._`;

                        const planMessage: Message = createAiMessage(planContent, {
                            id: `ai-plan-${Date.now()}`,
                            messageType: "plan",
                            sectionPlans: planResult.sectionPlans,
                            planSummary: planResult.planSummary,
                        });

                        setMessages((prev) =>
                            prev
                                .filter((message) => message.id !== planningMessage.id)
                                .concat(planMessage),
                        );
                    }
                } catch (error: unknown) {
                    console.error("Planning error:", error);
                    const errorMessage: Message = createAiMessage(
                        error instanceof RefineSessionExpiredError
                            ? error.message
                            : "Sorry, there was an error creating the plan. Please try again.",
                        {
                            id: `ai-error-${Date.now()}`,
                            messageType: "error",
                        },
                    );
                    setMessages((prev) =>
                        prev
                            .filter((message) => message.id !== planningMessage.id)
                            .concat(errorMessage),
                    );
                }
            }
        } catch (error: unknown) {
            console.error("Error sending message to AI:", error);

            const errorMessage: Message = {
                ...createAiMessage(
                    "Sorry, there was an error processing your request. Please try again.",
                ),
                id: (Date.now() + 1).toString(),
            };

            setMessages((prev) =>
                prev
                    .filter((message) => message.id !== tempAiMessage.id)
                    .concat(errorMessage),
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApprovePlan = async (): Promise<void> => {
        setIsPlanApproved(true);
        await sendMessage("approve", []);
    };

    // --- Re-attach to a refine job left running (page re-entry or new tab).
    // The watcher stands down on this page, so the page must resume polling.
    useEffect(() => {
        if (hasResumedRef.current) return;
        const job = useGenerationJobStore.getState().activeJob;
        if (!job || job.kind !== "refine") return;

        if (!portfolioId) {
            // Fresh tab: seed the id and let the effect re-run with it
            usePortfolioStore.getState().setPortfolioId(job.portfolioId);
            return;
        }

        hasResumedRef.current = true;

        const resume = async (): Promise<void> => {
            // Job state expired in Redis (finished long ago): the saved
            // portfolio is already loaded, so just drop the job
            try {
                const res = await fetch(`/api/portfolio/jobs/status/${job.jobId}`);
                if (res.status === 404 || res.status === 410) {
                    useGenerationJobStore.getState().clearJob();
                    return;
                }
            } catch {
                // Transient failure: attach anyway, the poller tolerates errors
            }

            const buildingMessage: Message = createGeneratingMessage("ai-building", {
                content: "Resuming your changes...",
                messageType: "build",
            });
            setMessages((prev) =>
                prev.filter((m) => !m.isGenerating).concat(buildingMessage),
            );
            setIsGenerating(true);
            pollBuildJob(job.jobId, buildingMessage.id);
        };

        void resume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portfolioId]);

    // Stop polling when the page unmounts so a later resume never runs
    // alongside a leaked interval from a previous mount
    useEffect(() => {
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, []);

    const handleKeepChatting = (): void => {
        setIsPlanApproved(false);
        setCurrentPlan(null);
    };

    return {
        isGenerating,
        currentPlan,
        isPlanApproved,
        sendMessage,
        handleApprovePlan,
        handleKeepChatting,
    };
};

/**
 * Merge newly completed sections into the existing sections array.
 * Modified sections overwrite by sectionKey, new sections are appended.
 */
const mergeSections = (
    existing: SectionDTO[] | null,
    incoming: SectionDTO[],
): SectionDTO[] => {
    const base = existing ? [...existing] : [];
    const baseByKey = new Map(base.map((s) => [s.sectionKey, s]));

    for (const section of incoming) {
        if (baseByKey.has(section.sectionKey)) {
            // Overwrite existing section
            const idx = base.findIndex((s) => s.sectionKey === section.sectionKey);
            if (idx !== -1) base[idx] = section;
        } else {
            // Append new section
            base.push(section);
        }
    }

    return base;
};
