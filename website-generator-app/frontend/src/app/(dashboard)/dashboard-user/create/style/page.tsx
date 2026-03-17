"use client";

import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { useStyleChat } from "@/hooks/useStyleChat";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createManualResumeTemplate,
    MANUAL_RESUME_SOURCE_KEY,
} from "@/utils/resume/manualResumeTemplate";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

const StyleDiscussionPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const portfolioId = searchParams.get("portfolioId");
    const { setParsedResumeData, setParsedResumeSourceKey } = usePortfolioStore();

    const {
        normalizedStyleMessages,
        isSending,
        showColorPicker,
        showTypographyPicker,
        recommendedHeadingFont,
        recommendedBodyFont,
        handleSend,
        handleColorSubmit,
        handleFontSubmit,
        flushStyleHistorySync,
    } = useStyleChat({ portfolioId, templateId });

    const handleContinueToResume = async () => {
        if (!portfolioId) {
            if (templateId) {
                router.push(`/dashboard-user/create/upload?templateId=${templateId}`);
                return;
            }
            router.push("/dashboard-user/create/upload");
            return;
        }

        try {
            await flushStyleHistorySync();
            const resumeRes = await fetch(`/api/portfolio/${portfolioId}/resume`);
            const resumeData = resumeRes.ok ? await resumeRes.json() : null;
            const hasParsedResume = Boolean(resumeData?.parsedJson);

            const nextStep = "review";
            await fetch(`/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: nextStep }),
            }).catch(() => null);

            if (!hasParsedResume) {
                setParsedResumeData(createManualResumeTemplate());
                setParsedResumeSourceKey(MANUAL_RESUME_SOURCE_KEY);
            }

            router.push(`/dashboard-user/create/review?portfolioId=${portfolioId}`);
        } catch {
            if (portfolioId) {
                await fetch(`/api/portfolio/${portfolioId}/update`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ last_step: "review" }),
                }).catch(() => null);
            }
            setParsedResumeData(createManualResumeTemplate());
            setParsedResumeSourceKey(MANUAL_RESUME_SOURCE_KEY);
            router.push(`/dashboard-user/create/review?portfolioId=${portfolioId}`);
        }
    };

    return (
        <main className="min-h-screen px-5 pb-8 pt-0 md:px-10 md:pb-10 md:pt-0">
            <PortfolioStyleChat
                messages={normalizedStyleMessages}
                isSending={isSending}
                onSendMessage={handleSend}
                onContinue={handleContinueToResume}
                continueLabel="Continue to Review & Edit"
                showColorPicker={showColorPicker}
                onColorSubmit={handleColorSubmit}
                showTypographyPicker={showTypographyPicker}
                onTypographySubmit={handleFontSubmit}
                recommendedHeadingFont={recommendedHeadingFont}
                recommendedBodyFont={recommendedBodyFont}
                className="max-w-7xl h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)]"
            />
        </main>
    );
};

export default StyleDiscussionPage;
