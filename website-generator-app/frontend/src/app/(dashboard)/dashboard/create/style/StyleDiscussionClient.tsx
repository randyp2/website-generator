"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { useStyleChat } from "@/hooks/useStyleChat";
import type { InitialStyleChatHistoryState } from "@/types/style-chat";
import { isPristineManualResumeTemplate } from "@/utils/resume/manualResumeTemplate";

interface StyleDiscussionClientProps {
    templateId: string | null;
    portfolioId: string | null;
    initialStyleChatHistoryPromise: Promise<InitialStyleChatHistoryState>;
}

const StyleDiscussionClient = ({
    templateId,
    portfolioId: routePortfolioId,
    initialStyleChatHistoryPromise,
}: StyleDiscussionClientProps) => {
    const router = useRouter();

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
        initialStyleChatHistoryPromise,
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

            await fetch(`/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: nextStep }),
            }).catch(() => null);

            if (!hasReviewableResume) {
                router.push(`/dashboard/create/upload?portfolioId=${portfolioId}`);
                return;
            }

            router.push(`/dashboard/create/review?portfolioId=${portfolioId}`);
        } catch {
            if (portfolioId) {
                await fetch(`/api/portfolio/${portfolioId}/update`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ last_step: "upload" }),
                }).catch(() => null);
            }
            router.push(`/dashboard/create/upload?portfolioId=${portfolioId}`);
        }
    };

    const handleAddCredits = () => {
        closeInsufficientCreditsModal();
        router.push("/dashboard/billing");
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
                className="h-[calc(100vh-7rem)] w-full max-w-[82.5rem] md:h-[calc(100vh-8rem)]"
            />

            {isInsufficientCreditsModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.72)",
                        backdropFilter: "blur(3px)",
                        zIndex: 90,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px",
                    }}
                    onClick={closeInsufficientCreditsModal}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "380px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            backgroundColor: "#111317",
                            padding: "20px",
                            color: "#ffffff",
                            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "18px",
                                fontWeight: 600,
                                lineHeight: 1.25,
                            }}
                        >
                            Insufficient credits
                        </h3>
                        <p
                            style={{
                                margin: "10px 0 0 0",
                                fontSize: "14px",
                                lineHeight: 1.45,
                                color: "rgba(255, 255, 255, 0.78)",
                            }}
                        >
                            You need more credits to continue with style chat.
                        </p>

                        <div
                            style={{
                                marginTop: "16px",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={closeInsufficientCreditsModal}
                                style={{
                                    border: "1px solid rgba(255, 255, 255, 0.14)",
                                    backgroundColor: "transparent",
                                    color: "rgba(255, 255, 255, 0.86)",
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCredits}
                                style={{
                                    border: "1px solid rgba(236, 164, 73, 0.9)",
                                    backgroundColor: "rgba(236, 164, 73, 0.16)",
                                    color: "#f4c06f",
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Add credits
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default StyleDiscussionClient;
