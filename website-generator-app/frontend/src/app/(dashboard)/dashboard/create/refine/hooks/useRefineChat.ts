"use client";

import { useRef, useState } from "react";
import type {
    CompletedSectionsResponse,
    GlobalTheme,
    SectionDTO,
} from "@/types/portfolio";
import type { Message, SectionPlan } from "@/types/preview";
import {
    buildPlannerSections,
    buildSectionContent,
    buildSectionSummaries,
} from "../lib/section-serializers";
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
    const sessionIdRef = useRef<string | null>(null);

    const callPlanner = async (): Promise<PlannerResponse | null> => {
        if (!portfolioId) return null;

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: sessionIdRef.current,
                sections: buildPlannerSections(sections),
            }),
        });

        if (!response.ok) {
            const error = (await response.json()) as { error?: string };
            throw new Error(error.error ?? "Plan request failed");
        }

        return (await response.json()) as PlannerResponse;
    };

    /**
     * Kick off the build — returns a jobId for polling.
     * The backend fans out section generation to RabbitMQ workers
     * and persists results asynchronously.
     */
    const callBuilder = async (
        sectionPlans: SectionPlan[],
    ): Promise<BuilderResponse | null> => {
        if (!portfolioId) return null;

        // Only send sections that have a "modify" plan — "add" sections have no existing
        // content, "delete" sections don't need LLM work
        const modifyKeys = new Set(
            sectionPlans
                .filter((p) => p.action === "modify")
                .map((p) => p.sectionKey),
        );
        const sectionsToSend = (sections ?? []).filter((s) =>
            modifyKeys.has(s.sectionKey),
        );

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/build`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: sessionIdRef.current,
                sections: buildSectionContent(sectionsToSend),
                sectionPlans,
            }),
        });

        if (!response.ok) {
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
                    sessionIdRef.current = null;
                }

                if (data.status === "FAILED") {
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

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

            // Start polling for incremental section updates
            pollBuildJob(buildResult.jobId, buildingMessage.id);
        } catch (error: unknown) {
            console.error("Build error:", error);
            setIsPlanApproved(false);
            const errorMessage: Message = createAiMessage(
                "Sorry, there was an error building your changes. Please try again.",
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
                    sessionId: sessionIdRef.current,
                    sections: buildSectionSummaries(sections),
                }),
            });

            const data = (await response.json()) as ClarifyResponse;

            // Store the sessionId returned by the backend (minted on first call)
            if (data.sessionId) {
                sessionIdRef.current = data.sessionId;
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
                        "Sorry, there was an error creating the plan. Please try again.",
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
