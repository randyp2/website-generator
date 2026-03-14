"use client";

import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { useStyleChat } from "@/hooks/useStyleChat";
import { useRouter, useSearchParams } from "next/navigation";

const StyleDiscussionPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const portfolioId = searchParams.get("portfolioId");

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

            const nextStep = hasParsedResume ? "review" : "upload";
            await fetch(`/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: nextStep }),
            }).catch(() => null);

            if (hasParsedResume) {
                router.push(`/dashboard-user/create/review?portfolioId=${portfolioId}`);
                return;
            }

            router.push(`/dashboard-user/create/upload?portfolioId=${portfolioId}`);
        } catch {
            await fetch(`/api/portfolio/${portfolioId}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ last_step: "upload" }),
            }).catch(() => null);
            router.push(`/dashboard-user/create/upload?portfolioId=${portfolioId}`);
        }
    };

    return (
        <main className="min-h-screen px-5 py-8 md:px-10 md:py-10">
            <PortfolioStyleChat
                messages={normalizedStyleMessages}
                isSending={isSending}
                onSendMessage={handleSend}
                onContinue={handleContinueToResume}
                continueLabel="Continue to Resume Parser"
                showColorPicker={showColorPicker}
                onColorSubmit={handleColorSubmit}
                showTypographyPicker={showTypographyPicker}
                onTypographySubmit={handleFontSubmit}
                recommendedHeadingFont={recommendedHeadingFont}
                recommendedBodyFont={recommendedBodyFont}
                className="max-w-7xl h-[calc(100vh-11rem)] md:h-[calc(100vh-12rem)]"
            />
        </main>
    );
};

export default StyleDiscussionPage;
