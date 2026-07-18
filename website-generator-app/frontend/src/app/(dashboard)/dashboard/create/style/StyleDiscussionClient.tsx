"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { useStyleChat } from "@/hooks/useStyleChat";
import { useToast } from "@/hooks/useToast";
import type { InitialStyleChatHistoryState } from "@/types/style-chat";
import { isPristineManualResumeTemplate } from "@/utils/resume/manualResumeTemplate";
import { InsufficientCreditsModal } from "./components/InsufficientCreditsModal";

interface StyleDiscussionClientProps {
    templateId: string | null;
    portfolioId: string | null;
    initialStyleChatHistory: InitialStyleChatHistoryState;
}

const patchLastStep = async (
    portfolioId: string,
    lastStep: string,
): Promise<void> => {
    const response = await fetch(`/api/portfolio/${portfolioId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_step: lastStep }),
    });

    if (response.ok) return;

    const payload: unknown = await response.json().catch(() => null);
    const message =
        typeof payload === "object" &&
        payload !== null &&
        typeof (payload as Record<string, unknown>).error === "string"
            ? String((payload as Record<string, unknown>).error)
            : "Failed to save your progress.";

    throw new Error(message);
};

const StyleDiscussionClient = ({
    templateId,
    portfolioId: routePortfolioId,
    initialStyleChatHistory,
}: StyleDiscussionClientProps) => {
    const router = useRouter();
    const { addToast } = useToast();

    const handlePortfolioCreated = useCallback(
        (createdPortfolioId: string) => {
            router.replace(`/dashboard/create/style?portfolioId=${createdPortfolioId}`, {
                scroll: false,
            });
        },
        [router],
    );

    const {
        portfolioId,
        normalizedStyleMessages,
        isLoadingHistory,
        isReadyForInteraction,
        isSending,
        showColorPicker,
        recommendedColorPresets,
        showTypographyPicker,
        recommendedHeadingFont,
        recommendedBodyFont,
        isInsufficientCreditsModalOpen,
        closeInsufficientCreditsModal,
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        handleLayoutSubmit,
        flushStyleHistorySync,
    } = useStyleChat({
        portfolioId: routePortfolioId,
        templateId,
        initialStyleChatHistory,
        onPortfolioCreated: handlePortfolioCreated,
    });

    const handleContinueToResume = async () => {
        if (!portfolioId || !isReadyForInteraction) {
            return;
        }

        try {
            await flushStyleHistorySync();
            const resumeRes = await fetch(`/api/portfolio/${portfolioId}/resume`);
            const resumeData = resumeRes.ok ? await resumeRes.json() : null;
            const hasReviewableResume =
                Boolean(resumeData?.parsedJson) &&
                !isPristineManualResumeTemplate(resumeData?.parsedJson);

            const nextStep = hasReviewableResume ? "review" : "upload";
            await patchLastStep(portfolioId, nextStep);
            router.push(`/dashboard/create/${nextStep}?portfolioId=${portfolioId}`);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to save your progress.";
            console.error("Failed to continue from style step:", error);
            addToast({
                type: "error",
                title: "Unable to continue",
                description: message,
            });
        }
    };

    const handleAddCredits = () => {
        closeInsufficientCreditsModal();
        router.push("/pricing");
    };

    return (
        <main className="min-h-screen px-4 pb-8 pt-0 md:px-6 md:pb-10 md:pt-0 lg:px-8">
            <PortfolioStyleChat
                messages={normalizedStyleMessages}
                isInitializing={isLoadingHistory}
                isInputDisabled={!isReadyForInteraction}
                isSending={isSending}
                onSendMessage={handleSend}
                onContinue={handleContinueToResume}
                continueLabel="Continue to Review & Edit"
                isContinueDisabled={!portfolioId || isSending || !isReadyForInteraction}
                showColorPicker={showColorPicker}
                recommendedColorPresets={recommendedColorPresets}
                onColorSubmit={handleColorSubmit}
                showTypographyPicker={showTypographyPicker}
                onTypographySubmit={handleFontSubmit}
                recommendedHeadingFont={recommendedHeadingFont}
                recommendedBodyFont={recommendedBodyFont}
                onLayoutSubmit={handleLayoutSubmit}
                className="min-h-[calc(100vh-7rem)] w-full max-w-[82.5rem] md:min-h-[calc(100vh-8rem)]"
            />

            {isInsufficientCreditsModalOpen && (
                <InsufficientCreditsModal
                    onClose={closeInsufficientCreditsModal}
                    onAddCredits={handleAddCredits}
                />
            )}
        </main>
    );
};

export default StyleDiscussionClient;
