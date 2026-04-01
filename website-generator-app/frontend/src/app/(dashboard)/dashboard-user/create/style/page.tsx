"use client";

import { Suspense } from "react";
import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { useStyleChat } from "@/hooks/useStyleChat";
import { useRouter, useSearchParams } from "next/navigation";

const StyleDiscussionPageContent: React.FC = () => {
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
        await flushStyleHistorySync();
        const params = portfolioId ? `?portfolioId=${portfolioId}` : templateId ? `?templateId=${templateId}` : "";
        router.push(`/dashboard-user/create/upload${params}`);
    };

    return (
        <main className="min-h-screen px-3 pb-6 pt-2 md:px-6 md:pb-10 md:pt-4">
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
                className="h-[calc(100vh-6.5rem)] w-full max-w-[94rem] md:h-[calc(100vh-7.5rem)]"
            />
        </main>
    );
};

const StyleDiscussionPage: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <StyleDiscussionPageContent />
        </Suspense>
    );
};

export default StyleDiscussionPage;
