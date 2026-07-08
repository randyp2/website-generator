"use client";

import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useVersions } from "@/hooks/useVersions";
import type { UploadedFile } from "@/types/file";
import { SidebarChatVersionTimeline } from "./SidebarChatVersionTimeline";
import { SidebarComposerActions } from "./SidebarComposerActions";
import type { ChatLayoutMode } from "./types";
import { UploadedFilePills } from "./UploadedFilePills";

interface SidebarChatComposerProps {
    uploadedFiles: UploadedFile[];
    isGenerating: boolean;
    portfolioId: string | null;
    isDownloading: boolean;
    layoutMode: ChatLayoutMode;
    onSendMessage: (prompt: string, files: File[]) => void;
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    onDownload: () => Promise<void>;
    onVersionActivated?: () => void;
    onLayoutModeChange?: (mode: ChatLayoutMode) => void;
}

export const SidebarChatComposer: React.FC<SidebarChatComposerProps> = ({
    uploadedFiles,
    isGenerating,
    portfolioId,
    isDownloading,
    layoutMode,
    onSendMessage,
    onFileSelect,
    onRemoveFile,
    onDownload,
    onVersionActivated,
    onLayoutModeChange,
}) => {
    const [prompt, setPrompt] = useState("");
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [showTimelineTrigger, setShowTimelineTrigger] = useState(true);
    const [showViewMenu, setShowViewMenu] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        versions,
        isLoading: isLoadingVersions,
        activateVersion,
        isActivating,
    } = useVersions(portfolioId);

    useEffect(() => {
        if (!textareaRef.current) return;

        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }, [prompt]);

    useEffect(() => {
        const newUrls = new Map<string, string>();

        uploadedFiles.forEach((file, index) => {
            const key = `${file.name}-${index}`;
            if (file.file instanceof File && file.type.startsWith("image/")) {
                newUrls.set(key, URL.createObjectURL(file.file));
            }
        });

        previewUrls.forEach((url, key) => {
            if (!newUrls.has(key)) URL.revokeObjectURL(url);
        });

        setPreviewUrls(newUrls);

        return () => {
            newUrls.forEach((url) => URL.revokeObjectURL(url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFiles]);

    const handleSend = () => {
        if (!prompt.trim() && uploadedFiles.length === 0) return;

        onSendMessage(
            prompt,
            uploadedFiles.map((file) => file.file),
        );
        setPrompt("");
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleDownload = async () => {
        if (isGenerating || isDownloading) return;

        try {
            await onDownload();
        } catch (err) {
            console.error("Download error:", err);
        }
    };

    const handleActivateVersion = async (versionId: string) => {
        const success = await activateVersion(versionId);
        if (!success) return;

        setIsTimelineOpen(false);
        onVersionActivated?.();
    };

    return (
        <div className="shrink-0 px-4 pb-4">
            <SidebarChatVersionTimeline
                isOpen={isTimelineOpen}
                showTrigger={showTimelineTrigger}
                versions={versions}
                isLoading={isLoadingVersions}
                isActivating={isActivating}
                onOpen={() => {
                    setShowTimelineTrigger(false);
                    setIsTimelineOpen(true);
                }}
                onClose={() => setIsTimelineOpen(false)}
                onExitComplete={() => setShowTimelineTrigger(true)}
                onActivate={handleActivateVersion}
            />

            <div
                className={`border border-border bg-card/95 p-4 backdrop-blur-lg dark:border-white/10 dark:bg-[#1a1d21] ${
                    isTimelineOpen ? "rounded-b-2xl border-t-0" : "rounded-2xl"
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                    multiple
                    onChange={(event) => onFileSelect(event.target.files)}
                    className="hidden"
                />

                <UploadedFilePills
                    uploadedFiles={uploadedFiles}
                    previewUrls={previewUrls}
                    onRemoveFile={onRemoveFile}
                />

                <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your refinement..."
                    disabled={isGenerating}
                    rows={1}
                    className="mb-3 max-h-[120px] min-h-[48px] w-full resize-none border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:focus-visible:border-white/30 dark:focus-visible:ring-white/10"
                />

                <SidebarComposerActions
                    uploadedFilesCount={uploadedFiles.length}
                    isGenerating={isGenerating}
                    isDownloading={isDownloading}
                    layoutMode={layoutMode}
                    showViewMenu={showViewMenu}
                    canSend={prompt.trim().length > 0 || uploadedFiles.length > 0}
                    hasLayoutModeChange={Boolean(onLayoutModeChange)}
                    onAttachClick={() => fileInputRef.current?.click()}
                    onToggleViewMenu={() => setShowViewMenu((prev) => !prev)}
                    onLayoutModeChange={(mode) => {
                        onLayoutModeChange?.(mode);
                        setShowViewMenu(false);
                    }}
                    onDownload={handleDownload}
                    onSend={handleSend}
                />
            </div>
        </div>
    );
};
