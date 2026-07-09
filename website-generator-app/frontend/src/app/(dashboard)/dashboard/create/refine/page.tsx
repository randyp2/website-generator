"use client";

import React, { useMemo, useState } from "react";
import { Preview } from "./components/Preview";
import { ChatHistoryOverlay } from "./components/ChatHistoryOverlay";
import { SidebarChatPanel } from "./components/SidebarChatPanel";
import { RefineChatPromptBar } from "./components/RefineChatPromptBar";
import { useInitialPortfolioGeneration } from "./hooks/useInitialPortfolioGeneration";
import { GenerationOverlay } from "./components/loaders/GenerationOverlay";
import { useRefineChat } from "./hooks/useRefineChat";
import { useRefinePortfolioHydration } from "./hooks/useRefinePortfolioHydration";
import { useRefineUploads } from "./hooks/useRefineUploads";
import { normalizeMessages } from "./lib/message-helpers";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { downloadPortfolioHtml } from "@/utils/downloadHtml";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AIRefinementPage: React.FC = () => {
    // Zustand store - All portfolio creation state
    const {
        portfolioId,
        templateId,
        parsedResumeData,
        stylePreferences,
        aiPrompt,
        sections,
        setSections,
        appendSections,
        globalTheme,
        setGlobalTheme,
        messages,
        setMessages,
        mediaFiles,
        videoFiles,
        addMediaFiles,
        addVideoFiles,
        removeMediaFile,
        removeVideoFile,
        chatLayoutMode,
        setChatLayoutMode,
    } = usePortfolioStore();

    // Messages & AI response
    const [isDownloading, setIsDownloading] = useState(false);

    const { isHydrating, hasResolvedInitialPortfolioLoad } =
        useRefinePortfolioHydration();
    const { generationPhase, totalSections } = useInitialPortfolioGeneration({
        portfolioId,
        templateId,
        parsedResumeData,
        aiPrompt,
        stylePreferences,
        sections,
        isHydrating,
        hasResolvedInitialPortfolioLoad,
        setSections,
        appendSections,
        setGlobalTheme,
        setMessages,
    });
    const {
        isGenerating,
        currentPlan,
        isPlanApproved,
        sendMessage,
        handleApprovePlan,
        handleKeepChatting,
    } = useRefineChat({
        portfolioId,
        sections,
        mediaFilesCount: mediaFiles.length,
        videoFilesCount: videoFiles.length,
        setSections,
        setGlobalTheme,
        setMessages,
        removeMediaFile,
        removeVideoFile,
    });

    const { uploadedFiles, handleFileSelect, removeFile } = useRefineUploads({
        mediaFiles,
        videoFiles,
        addMediaFiles,
        addVideoFiles,
        removeMediaFile,
        removeVideoFile,
    });
    const normalizedMessages = useMemo(() => normalizeMessages(messages), [messages]);

    // ========================================================================
    // VERSION ACTIVATED HANDLER
    // ========================================================================
    const handleVersionActivated = async () => {
        if (!portfolioId) return;

        try {
            const response = await fetch(`/api/portfolio/${portfolioId}/load`);
            const data = await response.json();

            if (response.ok) {
                setSections(Array.isArray(data?.sections) ? data.sections : []);
                if (data?.globalTheme) {
                    setGlobalTheme(data.globalTheme);
                }
            }
        } catch (error) {
            console.error("Failed to reload portfolio after version change:", error);
        }
    };

    // ========================================================================
    // DOWNLOAD HTML
    // ========================================================================
    const handleDownloadHtml = async () => {
        if (!portfolioId || !sections || sections.length === 0) {
            throw new Error("No portfolio to download");
        }

        setIsDownloading(true);
        try {
            await downloadPortfolioHtml(
                portfolioId,
                sections,
                globalTheme,
                "My Portfolio"
            );
        } finally {
            setIsDownloading(false);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
            {/* ================================================ */}
            {/* LAYER 1: SANDBOX - FULL SCREEN (BASE, z-0) */}
            {/* ================================================ */}
            <Preview
                sections={sections}
                globalTheme={globalTheme}
                generationPhase={generationPhase}
                totalSections={totalSections}
                layoutMode={chatLayoutMode}
                onLayoutModeChange={setChatLayoutMode}
                sidebarContent={
                    chatLayoutMode === 'sidebar' ? (
                        <div className="relative h-full">
                            <SidebarChatPanel
                                messages={normalizedMessages}
                                isGenerating={isGenerating || isHydrating}
                                uploadedFiles={uploadedFiles}
                                onSendMessage={sendMessage}
                                onFileSelect={handleFileSelect}
                                onRemoveFile={removeFile}
                                showPlanActions={Boolean(currentPlan) && !isPlanApproved}
                                onApprovePlan={handleApprovePlan}
                                onKeepChatting={handleKeepChatting}
                                portfolioId={portfolioId}
                                onVersionActivated={handleVersionActivated}
                                onDownload={handleDownloadHtml}
                                isDownloading={isDownloading}
                                layoutMode={chatLayoutMode}
                                onLayoutModeChange={setChatLayoutMode}
                            />
                            <GenerationOverlay phase={generationPhase} />
                        </div>
                    ) : null
                }
            />

            {/* ================================================ */}
            {/* LAYER 2: CHAT HISTORY OVERLAY - CENTER (z-40) */}
            {/* Only visible in floating mode */}
            {/* ================================================ */}
            {chatLayoutMode === 'floating' && (
                <ChatHistoryOverlay
                    messages={normalizedMessages}
                    isGenerating={isGenerating || isHydrating}
                />
            )}

            {/* ================================================ */}
            {/* LAYER 3: FLOATING PROMPT BAR - BOTTOM (z-50) */}
            {/* Only visible in floating mode */}
            {/* ================================================ */}
            {chatLayoutMode === 'floating' && (
                <RefineChatPromptBar
                    uploadedFiles={uploadedFiles}
                    onSendMessage={sendMessage}
                    onFileSelect={handleFileSelect}
                    onRemoveFile={removeFile}
                    isGenerating={isGenerating || isHydrating}
                    showPlanActions={Boolean(currentPlan) && !isPlanApproved}
                    onApprovePlan={handleApprovePlan}
                    onKeepChatting={handleKeepChatting}
                    portfolioId={portfolioId}
                    onVersionActivated={handleVersionActivated}
                    onDownload={handleDownloadHtml}
                    isDownloading={isDownloading}
                    layoutMode={chatLayoutMode}
                    onLayoutModeChange={setChatLayoutMode}
                    placement="floating"
                />
            )}

            {/* Preview mode: no chat UI rendered */}
        </div>
    );
};

export default AIRefinementPage;
