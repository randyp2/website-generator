"use client";

import { useRef, useState } from "react";
import {
    applyMockRefinement,
    buildMockRefinePlan,
} from "@/lib/mock-portfolios";
import type { GlobalTheme, SectionDTO } from "@/types/portfolio";
import type { Message, SectionPlan } from "@/types/preview";
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
    const sessionIdRef = useRef<string | null>(null);
    const lastPromptRef = useRef<string>("");

    const approvePlanAndBuild = async (): Promise<void> => {
        if (!currentPlan || currentPlan.length === 0) return;

        setIsGenerating(true);

        const buildingMessage: Message = createGeneratingMessage("ai-building", {
            content: "Applying your mock refinement...",
            messageType: "build",
        });
        setMessages((prev) => [...prev, buildingMessage]);

        try {
            await new Promise((resolve) => window.setTimeout(resolve, 450));
            const refined = applyMockRefinement({
                sections,
                prompt: lastPromptRef.current || currentPlan[0]?.instruction || "Mock refinement",
            });

            setSections(refined.sections);
            setGlobalTheme(refined.globalTheme);

            const completeMessage: Message = createAiMessage(
                "Mock portfolio updated locally. No backend refine job was used.",
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
            setIsGenerating(false);
            setIsPlanApproved(false);
            sessionIdRef.current = null;
        } catch (error: unknown) {
            console.error("Build error:", error);
            const errorMessage: Message = createAiMessage(
                "Sorry, there was an error applying the local mock refinement. Please try again.",
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

        lastPromptRef.current = prompt.trim();

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
            await new Promise((resolve) => window.setTimeout(resolve, 350));
            sessionIdRef.current = sessionIdRef.current ?? `mock-session-${Date.now()}`;

            const clarifyMessage: Message = {
                ...createAiMessage(
                    "This refine chat is now scripted. I can turn your request into a local mock plan and update the template without backend services.",
                    {
                        messageType: "clarify",
                        readyForPlanning: true,
                    },
                ),
                id: (Date.now() + 1).toString(),
            };

            setMessages((prev) =>
                prev
                    .filter((message) => message.id !== tempAiMessage.id)
                    .concat(clarifyMessage),
            );

            const planningMessage: Message = createGeneratingMessage("ai-planning", {
                content: "Creating a mock modification plan...",
                messageType: "plan",
            });
            setMessages((prev) => [...prev, planningMessage]);

            await new Promise((resolve) => window.setTimeout(resolve, 300));
            const planResult = buildMockRefinePlan(prompt, sections);

            setCurrentPlan(planResult.sectionPlans);
            setIsPlanApproved(false);

            const planDetails = planResult.sectionPlans
                .filter((plan) => plan.action === "modify" || plan.action === "add")
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
        } catch (error: unknown) {
            console.error("Error sending message to mock refine flow:", error);
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
