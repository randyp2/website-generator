"use client";

import React, { useEffect, useRef } from "react";
import { PlanApprovalBar } from "@/components/chat/style-chat/RefinePlanCard";
import type { UploadedFile } from "@/types/file";
import { SidebarChatMessages } from "./sidebar-chat/SidebarChatMessages";
import type { ChatLayoutMode, ChatMessage } from "./sidebar-chat/types";
import { useCompletedStreamingIds } from "./sidebar-chat/useCompletedStreamingIds";
import { RefineChatPromptBar } from "./RefineChatPromptBar";

interface SidebarChatPanelProps {
    messages: ChatMessage[];
    isGenerating: boolean;
    uploadedFiles: UploadedFile[];
    onSendMessage: (prompt: string, files: File[]) => void;
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    showPlanActions?: boolean;
    onApprovePlan?: () => void;
    onKeepChatting?: () => void;
    portfolioId: string | null;
    versionsRefreshKey?: number;
    onVersionActivated?: () => void;
    onDownload: () => Promise<void>;
    isDownloading?: boolean;
    layoutMode?: ChatLayoutMode;
    onLayoutModeChange?: (mode: ChatLayoutMode) => void;
}

export const SidebarChatPanel: React.FC<SidebarChatPanelProps> = ({
    messages,
    isGenerating,
    uploadedFiles,
    onSendMessage,
    onFileSelect,
    onRemoveFile,
    showPlanActions = false,
    onApprovePlan,
    onKeepChatting,
    portfolioId,
    versionsRefreshKey = 0,
    onVersionActivated,
    onDownload,
    isDownloading = false,
    layoutMode = "sidebar",
    onLayoutModeChange,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [completedStreamingIds, markStreamingComplete] =
        useCompletedStreamingIds();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex h-full flex-col border-r border-border bg-card/95 text-foreground backdrop-blur-2xl dark:border-white/10 dark:bg-[#1c1d22]/92 dark:text-white">
            <SidebarChatMessages
                messages={messages}
                completedStreamingIds={completedStreamingIds}
                messagesEndRef={messagesEndRef}
                onStreamingComplete={markStreamingComplete}
            />

            {showPlanActions && (
                <PlanApprovalBar
                    isGenerating={isGenerating}
                    onApprovePlan={onApprovePlan}
                    onKeepChatting={onKeepChatting}
                />
            )}

            <RefineChatPromptBar
                uploadedFiles={uploadedFiles}
                isGenerating={isGenerating}
                portfolioId={portfolioId}
                versionsRefreshKey={versionsRefreshKey}
                isDownloading={isDownloading}
                layoutMode={layoutMode}
                onSendMessage={onSendMessage}
                onFileSelect={onFileSelect}
                onRemoveFile={onRemoveFile}
                onDownload={onDownload}
                onVersionActivated={onVersionActivated}
                onLayoutModeChange={onLayoutModeChange}
                placement="sidebar"
            />
        </div>
    );
};
