"use client";

import { StyleChatComposer, type StyleChatComposerAction } from "@/components/chat/style-chat/StyleChatComposer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/types/file";
import type { Version } from "@/types/version";
import { useVersions } from "@/hooks/useVersions";
import { AnimatePresence, motion } from "framer-motion";
import {
    Download,
    Eye,
    Loader2,
    MessageSquare,
    Monitor,
    PanelLeft,
    Paperclip,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UploadedFilePills } from "./sidebar-chat/UploadedFilePills";
import type { ChatLayoutMode } from "./sidebar-chat/types";
import { VersionTimelineDrawer, VersionTimelineTrigger } from "./version-timeline";

interface RefineChatPromptBarProps {
    uploadedFiles: UploadedFile[];
    onSendMessage: (prompt: string, files: File[]) => void;
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    isGenerating: boolean;
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
    placement?: "sidebar" | "floating";
}

const layoutModeOptions: Array<{
    value: ChatLayoutMode;
    label: string;
    icon: StyleChatComposerAction["icon"];
}> = [
    { value: "sidebar", label: "Sidebar chat", icon: PanelLeft },
    { value: "floating", label: "Floating chat", icon: MessageSquare },
    { value: "preview", label: "Preview only", icon: Monitor },
];

export const RefineChatPromptBar: React.FC<RefineChatPromptBarProps> = ({
    uploadedFiles,
    onSendMessage,
    onFileSelect,
    onRemoveFile,
    isGenerating,
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
    placement = "sidebar",
}) => {
    const [prompt, setPrompt] = useState("");
    const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [showTimelineTrigger, setShowTimelineTrigger] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previousVersionsRefreshKeyRef = useRef(versionsRefreshKey);

    const {
        versions,
        isLoading: isLoadingVersions,
        refetch: refetchVersions,
        activateVersion,
        isActivating,
    } = useVersions(portfolioId);

    useEffect(() => {
        if (previousVersionsRefreshKeyRef.current === versionsRefreshKey) return;

        previousVersionsRefreshKeyRef.current = versionsRefreshKey;
        void refetchVersions();
    }, [refetchVersions, versionsRefreshKey]);

    useEffect(() => {
        const nextUrls = new Map<string, string>();

        uploadedFiles.forEach((file, index) => {
            const key = `${file.name}-${index}`;
            if (file.file instanceof File && file.type.startsWith("image/")) {
                nextUrls.set(key, URL.createObjectURL(file.file));
            }
        });

        previewUrls.forEach((url, key) => {
            if (!nextUrls.has(key)) URL.revokeObjectURL(url);
        });

        setPreviewUrls(nextUrls);

        return () => {
            nextUrls.forEach((url) => URL.revokeObjectURL(url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFiles]);

    const handleSend = () => {
        const trimmedPrompt = prompt.trim();
        if (isGenerating || (!trimmedPrompt && uploadedFiles.length === 0)) return;

        onSendMessage(
            prompt,
            uploadedFiles.map((file) => file.file),
        );
        setPrompt("");
    };

    const handleDownload = useCallback(async () => {
        if (isGenerating || isDownloading) return;

        try {
            await onDownload();
        } catch (error) {
            console.error("Download error:", error);
        }
    }, [isDownloading, isGenerating, onDownload]);

    const handleActivateVersion = async (versionId: string) => {
        const success = await activateVersion(versionId);
        if (!success) return;

        setIsTimelineOpen(false);
        onVersionActivated?.();
    };

    const actions = useMemo<StyleChatComposerAction[]>(() => {
        const items: StyleChatComposerAction[] = [
            {
                icon: Paperclip,
                label:
                    uploadedFiles.length > 0
                        ? `Attach files (${uploadedFiles.length})`
                        : "Attach files",
                onSelect: () => fileInputRef.current?.click(),
            },
        ];

        if (onLayoutModeChange) {
            items.push(
                {
                    icon: Eye,
                    label: "View modes",
                    disabled: true,
                },
                ...layoutModeOptions.map(({ value, label, icon }) => ({
                    icon,
                    label,
                    onSelect: () => onLayoutModeChange(value),
                    trailing:
                        layoutMode === value ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-white" />
                        ) : null,
                })),
            );
        }

        items.push({
            icon: isDownloading ? Loader2 : Download,
            label: isDownloading ? "Downloading..." : "Download HTML",
            onSelect: handleDownload,
            disabled: isGenerating || isDownloading,
        });

        return items;
    }, [
        handleDownload,
        isDownloading,
        isGenerating,
        layoutMode,
        onLayoutModeChange,
        uploadedFiles.length,
    ]);

    const frameClass =
        placement === "floating"
            ? "fixed bottom-6 left-1/2 z-50 w-[90%] max-w-3xl -translate-x-1/2"
            : "shrink-0 px-4 pb-4";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={frameClass}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                multiple
                onChange={(event) => {
                    onFileSelect(event.target.files);
                    event.currentTarget.value = "";
                }}
                className="hidden"
            />

            <div className="mx-auto w-full max-w-3xl">
                <VersionTimeline
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

                <UploadedFilePills
                    uploadedFiles={uploadedFiles}
                    previewUrls={previewUrls}
                    onRemoveFile={onRemoveFile}
                />

                {showPlanActions ? (
                    <RefinePlanPrompt
                        isGenerating={isGenerating}
                        onApprovePlan={onApprovePlan}
                        onKeepChatting={onKeepChatting}
                    />
                ) : (
                    <StyleChatComposer
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        onSend={handleSend}
                        isInputDisabled={isGenerating}
                        isSendDisabled={
                            isGenerating ||
                            (!prompt.trim() && uploadedFiles.length === 0)
                        }
                        placeholder="Describe your portfolio refinement..."
                        actions={actions}
                        actionsPlacement="up"
                    />
                )}
            </div>
        </motion.div>
    );
};

interface VersionTimelineProps {
    isOpen: boolean;
    showTrigger: boolean;
    versions: Version[];
    isLoading: boolean;
    isActivating: boolean;
    onOpen: () => void;
    onClose: () => void;
    onExitComplete: () => void;
    onActivate: (versionId: string) => void;
}

const VersionTimeline: React.FC<VersionTimelineProps> = ({
    isOpen,
    showTrigger,
    versions,
    isLoading,
    isActivating,
    onOpen,
    onClose,
    onExitComplete,
    onActivate,
}) => (
    <div className="flex flex-col items-center">
        {showTrigger && (
            <div data-version-trigger>
                <VersionTimelineTrigger isOpen={isOpen} onClick={onOpen} />
            </div>
        )}

        <AnimatePresence onExitComplete={onExitComplete}>
            {isOpen && (
                <VersionTimelineDrawer
                    versions={versions}
                    isLoading={isLoading}
                    onClose={onClose}
                    onActivate={onActivate}
                    isActivating={isActivating}
                />
            )}
        </AnimatePresence>
    </div>
);

interface RefinePlanPromptProps {
    isGenerating: boolean;
    onApprovePlan?: () => void;
    onKeepChatting?: () => void;
}

const RefinePlanPrompt: React.FC<RefinePlanPromptProps> = ({
    isGenerating,
    onApprovePlan,
    onKeepChatting,
}) => (
    <div className="rounded-3xl border border-orange-400/30 bg-orange-50/80 p-4 text-foreground shadow-[0_18px_48px_rgba(249,115,22,0.12)] backdrop-blur-2xl dark:border-orange-900/45 dark:bg-orange-950/35 dark:text-orange-50 dark:shadow-[0_18px_48px_rgba(124,45,18,0.24)]">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-orange-700/80 dark:text-orange-300/80">
            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)] dark:bg-orange-500 dark:shadow-[0_0_14px_rgba(194,65,12,0.75)]" />
            Approve plan
        </div>
        <p className="mt-2 text-sm text-foreground/90 dark:text-orange-100/80">
            Review the planned changes, then apply or keep refining.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
                type="button"
                onClick={onApprovePlan}
                disabled={isGenerating}
                className="h-10 cursor-pointer rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Apply changes
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={onKeepChatting}
                disabled={isGenerating}
                className={cn(
                    "h-10 cursor-pointer rounded-full border-zinc-200 bg-zinc-100 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50",
                    "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
                )}
            >
                Keep chatting
            </Button>
        </div>
    </div>
);
