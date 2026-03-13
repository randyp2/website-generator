"use client";

import { useState } from "react";
import type { GlobalTheme, SectionDTO } from "@/types/portfolio";
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
    buildSummary: string;
    modifiedSections: SectionDTO[];
    globalTheme?: GlobalTheme | null;
}

interface ClarifyResponse {
    assistantMessage?: string;
    readyForPlanning?: boolean;
    error?: string;
}

interface UseRefineChatResult {
    isGenerating: boolean;
    currentPlan: SectionPlan[] | null;
    isPlanApproved: boolean;
    sendMessage: (prompt: string, files: File[]) => Promise<void>;
    handleApprovePlan: () => Promise<void>;
    handleKeepChatting: () => void;
}

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

    const callPlanner = async (): Promise<PlannerResponse | null> => {
        if (!portfolioId) return null;

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sections: buildPlannerSections(sections),
            }),
        });

        if (!response.ok) {
            const error = (await response.json()) as { error?: string };
            throw new Error(error.error ?? "Plan request failed");
        }

        return (await response.json()) as PlannerResponse;
    };

    const callBuilder = async (
        sectionPlans: SectionPlan[],
    ): Promise<BuilderResponse | null> => {
        if (!portfolioId) return null;

        const response = await fetch(`/api/portfolio/${portfolioId}/refine/build`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sections: buildSectionContent(sections),
                sectionPlans,
            }),
        });

        if (!response.ok) {
            const error = (await response.json()) as { error?: string };
            throw new Error(error.error ?? "Build request failed");
        }

        return (await response.json()) as BuilderResponse;
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

            if (buildResult?.modifiedSections) {
                const updatedSections: SectionDTO[] = buildResult.modifiedSections.map(
                    (modified) => ({
                        sectionKey: modified.sectionKey,
                        title: modified.title,
                        reactSource: modified.reactSource,
                        contentJson: modified.contentJson,
                        orderIndex:
                            modified.orderIndex ??
                            sections?.find(
                                (section) => section.sectionKey === modified.sectionKey,
                            )?.orderIndex ??
                            0,
                    }),
                );

                setSections(updatedSections);
            }

            if (buildResult?.globalTheme) {
                setGlobalTheme(buildResult.globalTheme);
            }

            const completeMessage: Message = createAiMessage(
                buildResult?.buildSummary ?? "Portfolio updated successfully!",
                {
                    id: `ai-complete-${Date.now()}`,
                    messageType: "build",
                },
            );

            setMessages((prev) =>
                prev
                    .filter((message) => message.id !== buildingMessage.id)
                    .concat(completeMessage),
            );

            setCurrentPlan(null);
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
        } finally {
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
                    sections: buildSectionSummaries(sections),
                }),
            });

            const data = (await response.json()) as ClarifyResponse;

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
