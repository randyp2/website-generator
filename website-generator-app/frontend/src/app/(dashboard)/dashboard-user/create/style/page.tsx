"use client";

import { PortfolioStyleChat } from "@/components/chat/PortfolioStyleChat";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { StyleChatResponse } from "@/types/style";

const StyleDiscussionPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const portfolioId = searchParams.get("portfolioId");

    const {
        setTemplateId,
        setPortfolioId,
        styleMessages,
        stylePreferences,
        setStyleMessages,
        setStylePreferences,
        isSendingStyle,
        setIsSendingStyle,
    } = usePortfolioStore();

    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        if (styleMessages.length > 0) return;
        setStyleMessages([
            {
                id: "style-assistant-intro",
                role: "ai",
                content:
                    "Hey! I'm your design consultant. Tell me about your vision — what's the overall theme or goal for your portfolio? For example: 'clean minimalist developer portfolio' or 'bold creative agency showcase'.",
                timestamp: new Date(),
            },
        ]);
    }, [setStyleMessages, styleMessages.length]);

    const normalizedStyleMessages = useMemo(
        () =>
            styleMessages.map((message) => ({
                ...message,
                timestamp:
                    message.timestamp instanceof Date
                        ? message.timestamp
                        : new Date(message.timestamp),
            })),
        [styleMessages],
    );

    useEffect(() => {
        if (templateId) {
            setTemplateId(templateId);
        }
        if (portfolioId) {
            setPortfolioId(portfolioId);
        }
    }, [portfolioId, setPortfolioId, setTemplateId, templateId]);

    useEffect(() => {
        if (!portfolioId) return;
        fetch(`/api/portfolio/${portfolioId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_step: "style" }),
        }).catch(() => null);
    }, [portfolioId]);

    const handleSend = useCallback(
        async (prompt: string) => {
            const hasUserMessages = styleMessages.some((m) => m.role === "user");
            if (!hasUserMessages) {
                const seededNotes = stylePreferences.customNotes?.trim()
                    ? `${stylePreferences.customNotes}\n${prompt}`
                    : prompt;
                setStylePreferences({
                    ...stylePreferences,
                    customNotes: seededNotes,
                });
            }

            setStyleMessages((prev) => [
                ...prev,
                {
                    id: `user-${Date.now()}`,
                    role: "user",
                    content: prompt,
                    timestamp: new Date(),
                },
            ]);

            if (!portfolioId) return;

            setIsSendingStyle(true);
            try {
                console.log(
                    "[style-chat] Sending message with stylePrefs:",
                    stylePreferences,
                );
                const res = await fetch("/api/portfolio/style-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ portfolioId, userMessage: prompt }),
                });

                if (!res.ok) {
                    throw new Error("Style chat request failed");
                }

                const data: StyleChatResponse = await res.json();

                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: data.assistantMessage,
                        timestamp: new Date(),
                    },
                ]);

                if (data.showColorPicker) {
                    setShowColorPicker(true);
                }

                if (data.stylePreferences) {
                    const prefs = data.stylePreferences;
                    console.log(
                        "[style-chat] Received stylePrefs update:",
                        prefs,
                    );
                    setStylePreferences({
                        colorScheme:
                            prefs.colorScheme ?? stylePreferences.colorScheme,
                        layoutDensity:
                            prefs.layoutDensity ?? stylePreferences.layoutDensity,
                        tone: prefs.tone ?? stylePreferences.tone,
                        visualStyle:
                            prefs.visualStyle ?? stylePreferences.visualStyle,
                        sectionEmphasis:
                            prefs.sectionEmphasis ??
                            stylePreferences.sectionEmphasis,
                        typography:
                            prefs.typography ?? stylePreferences.typography,
                        animationStyle:
                            prefs.animationStyle ??
                            stylePreferences.animationStyle,
                        whitespace:
                            prefs.whitespace ?? stylePreferences.whitespace,
                        imageryStyle:
                            prefs.imageryStyle ?? stylePreferences.imageryStyle,
                        interactiveElements:
                            prefs.interactiveElements ??
                            stylePreferences.interactiveElements,
                        customNotes:
                            prefs.customNotes?.trim() ||
                            stylePreferences.customNotes,
                    });
                }
            } catch (error) {
                console.error("Style chat error:", error);
                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "ai",
                        content:
                            "Sorry, something went wrong. Please try sending your message again.",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            portfolioId,
            styleMessages,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
        ],
    );

    const handleColorSubmit = useCallback(
        async (colors: Record<string, string>) => {
            // Add a user message showing selected colors
            const colorSummary = Object.entries(colors)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");

            setStyleMessages((prev) => [
                ...prev,
                {
                    id: `user-colors-${Date.now()}`,
                    role: "user",
                    content: `Selected colors: ${colorSummary}`,
                    timestamp: new Date(),
                },
            ]);

            setShowColorPicker(false);

            if (!portfolioId) return;

            setIsSendingStyle(true);
            try {
                console.log(
                    "[style-chat] Submitting colors with stylePrefs:",
                    stylePreferences,
                );
                const res = await fetch("/api/portfolio/style-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        portfolioId,
                        colorSelections: colors,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Color submission failed");
                }

                const data: StyleChatResponse = await res.json();

                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `ai-${Date.now()}`,
                        role: "ai",
                        content: data.assistantMessage,
                        timestamp: new Date(),
                    },
                ]);

                if (data.stylePreferences) {
                    const prefs = data.stylePreferences;
                    console.log(
                        "[style-chat] Received stylePrefs update:",
                        prefs,
                    );
                    setStylePreferences({
                        colorScheme:
                            prefs.colorScheme ?? stylePreferences.colorScheme,
                        layoutDensity:
                            prefs.layoutDensity ?? stylePreferences.layoutDensity,
                        tone: prefs.tone ?? stylePreferences.tone,
                        visualStyle:
                            prefs.visualStyle ?? stylePreferences.visualStyle,
                        sectionEmphasis:
                            prefs.sectionEmphasis ??
                            stylePreferences.sectionEmphasis,
                        typography:
                            prefs.typography ?? stylePreferences.typography,
                        animationStyle:
                            prefs.animationStyle ??
                            stylePreferences.animationStyle,
                        whitespace:
                            prefs.whitespace ?? stylePreferences.whitespace,
                        imageryStyle:
                            prefs.imageryStyle ?? stylePreferences.imageryStyle,
                        interactiveElements:
                            prefs.interactiveElements ??
                            stylePreferences.interactiveElements,
                        customNotes:
                            prefs.customNotes?.trim() ||
                            stylePreferences.customNotes,
                    });
                }
            } catch (error) {
                console.error("Color submit error:", error);
                setStyleMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: "ai",
                        content:
                            "Sorry, something went wrong submitting your colors. Please try again.",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsSendingStyle(false);
            }
        },
        [
            portfolioId,
            stylePreferences,
            setStyleMessages,
            setStylePreferences,
            setIsSendingStyle,
        ],
    );

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
        <main className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1220] to-black px-6 py-8 md:px-10 md:py-10">
            <div className="mx-auto mb-6 w-full max-w-5xl">
                <h1 className="text-3xl font-semibold text-white md:text-4xl">
                    Customize Your Style
                </h1>
                <p className="mt-2 text-sm text-white/65 md:text-base">
                    Use chat to guide the look and feel of your portfolio.
                </p>
            </div>

            <PortfolioStyleChat
                messages={normalizedStyleMessages}
                isSending={isSendingStyle}
                onSendMessage={handleSend}
                onContinue={handleContinueToResume}
                continueLabel="Continue to Resume Parser"
                showColorPicker={showColorPicker}
                onColorSubmit={handleColorSubmit}
            />
        </main>
    );
};

export default StyleDiscussionPage;
