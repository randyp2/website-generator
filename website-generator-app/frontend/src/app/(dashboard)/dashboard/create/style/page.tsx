"use client";

import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { useStyleChat } from "@/hooks/useStyleChat";
import { useRouter, useSearchParams } from "next/navigation";
import {
    isPristineManualResumeTemplate,
} from "@/utils/resume/manualResumeTemplate";

const StyleDiscussionPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const portfolioId = searchParams.get("portfolioId");

    const {
        normalizedStyleMessages,
        isSending,
        showColorPicker,
        recommendedColorPresets,
        showTypographyPicker,
        recommendedHeadingFont,
        recommendedBodyFont,
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        handleLayoutSubmit,
        flushStyleHistorySync,
    } = useStyleChat({ portfolioId, templateId });

    const handleContinueToResume = async () => {
        if (!portfolioId) {
            if (templateId) {
                router.push(`/dashboard/create/upload?templateId=${templateId}`);
                return;
            }
            router.push("/dashboard/create/upload");
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

    return (
        <main className="min-h-screen px-4 pb-8 pt-0 md:px-6 md:pb-10 md:pt-0">
            <PortfolioStyleChat
                messages={normalizedStyleMessages}
                isSending={isSending}
                onSendMessage={handleSend}
                onContinue={handleContinueToResume}
                continueLabel="Continue to Review & Edit"
                showColorPicker={showColorPicker}
                recommendedColorPresets={recommendedColorPresets}
                onColorSubmit={handleColorSubmit}
                showTypographyPicker={showTypographyPicker}
                onTypographySubmit={handleFontSubmit}
                recommendedHeadingFont={recommendedHeadingFont}
                recommendedBodyFont={recommendedBodyFont}
                onLayoutSubmit={handleLayoutSubmit}
                className="h-[calc(100vh-7rem)] w-full max-w-[92rem] md:h-[calc(100vh-8rem)]"
            />
        </main>
    );
};

export default StyleDiscussionPage;
