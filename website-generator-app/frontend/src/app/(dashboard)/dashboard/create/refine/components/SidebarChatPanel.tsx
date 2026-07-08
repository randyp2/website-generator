"use client";

import React, { useEffect, useRef } from "react";
import type { UploadedFile } from "@/types/file";
import { PlanApprovalBar } from "./sidebar-chat/RefinePlanCard";
import { SidebarChatComposer } from "./sidebar-chat/SidebarChatComposer";
import { SidebarChatMessages } from "./sidebar-chat/SidebarChatMessages";
import type { ChatLayoutMode, ChatMessage } from "./sidebar-chat/types";
import { useCompletedStreamingIds } from "./sidebar-chat/useCompletedStreamingIds";

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
        <div className="flex h-full flex-col border-r border-border bg-background/95 text-foreground backdrop-blur-md dark:border-white/10 dark:bg-black/60 dark:text-white">
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

            <SidebarChatComposer
                uploadedFiles={uploadedFiles}
                isGenerating={isGenerating}
                portfolioId={portfolioId}
                isDownloading={isDownloading}
                layoutMode={layoutMode}
                onSendMessage={onSendMessage}
                onFileSelect={onFileSelect}
                onRemoveFile={onRemoveFile}
                onDownload={onDownload}
                onVersionActivated={onVersionActivated}
                onLayoutModeChange={onLayoutModeChange}
            />
        </div>
    );
};
