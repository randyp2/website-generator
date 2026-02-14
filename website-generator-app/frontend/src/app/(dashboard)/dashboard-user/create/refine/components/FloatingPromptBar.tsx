"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Eye,
    Loader2,
    MessageSquare,
    Monitor,
    PanelLeft,
    Paperclip,
    Palette,
    Send,
    X,
    Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { UploadedFile } from "@/types/file";
import { useVersions } from "@/hooks/useVersions";
import { VersionTimelineTrigger, VersionTimelineDrawer } from "./version-timeline";

interface FloatingPromptBarProps {
    uploadedFiles: UploadedFile[];
    onSendMessage: (prompt: string, files: File[]) => void;
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    isGenerating: boolean;
    showPlanActions?: boolean;
    onApprovePlan?: () => void;
    onKeepChatting?: () => void;
    portfolioId: string | null;
    onVersionActivated?: () => void;
    onDownload: () => Promise<void>;
    isDownloading?: boolean;
    layoutMode?: "sidebar" | "floating" | "preview";
    onLayoutModeChange?: (mode: "sidebar" | "floating" | "preview") => void;
}

export const FloatingPromptBar: React.FC<FloatingPromptBarProps> = ({
    uploadedFiles,
    onSendMessage,
    onFileSelect,
    onRemoveFile,
    isGenerating,
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
    // Local state
    const [prompt, setPrompt] = useState("");
    const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [showTimelineTrigger, setShowTimelineTrigger] = useState(true);
    const [showViewMenu, setShowViewMenu] = useState(false);

    // Version management
    const {
        versions,
        isLoading: isLoadingVersions,
        activateVersion,
        isActivating,
    } = useVersions(portfolioId);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    // Create and cleanup preview URLs
    useEffect(() => {
        const newUrls = new Map<string, string>();

        uploadedFiles.forEach((file, index) => {
            const key = `${file.name}-${index}`;
            if (file.file && file.file instanceof File && file.type.startsWith("image/")) {
                newUrls.set(key, URL.createObjectURL(file.file));
            }
        });

        // Cleanup old URLs that are no longer needed
        previewUrls.forEach((url, key) => {
            if (!newUrls.has(key)) {
                URL.revokeObjectURL(url);
            }
        });

        setPreviewUrls(newUrls);

        // Cleanup on unmount
        return () => {
            newUrls.forEach((url) => URL.revokeObjectURL(url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFiles]);

    // Send handler
    const handleSend = () => {
        if (!prompt.trim() && uploadedFiles.length === 0) return;

        const files = uploadedFiles.map((f) => f.file);
        onSendMessage(prompt, files);
        setPrompt("");
    };

    // Keyboard handler
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Open file explorer
    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleDownload = async () => {
        if (isGenerating || isDownloading) return;
        try {
            await onDownload();
        } catch (err) {
            console.error("Download error:", err);
        }
    };

    // Version action handlers
    const handleActivateVersion = async (versionId: string) => {
        const success = await activateVersion(versionId);
        if (success) {
            setIsTimelineOpen(false);
            onVersionActivated?.();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50"
        >
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                multiple
                onChange={(e) => onFileSelect(e.target.files)}
                className="hidden"
            />

            {/* Version Timeline - expands upward from prompt bar */}
            <div className="flex flex-col items-center">
                {showTimelineTrigger && (
                    <div data-version-trigger>
                        <VersionTimelineTrigger
                            isOpen={isTimelineOpen}
                            onClick={() => {
                                setShowTimelineTrigger(false);
                                setIsTimelineOpen(true);
                            }}
                        />
                    </div>
                )}

                <AnimatePresence
                    onExitComplete={() => setShowTimelineTrigger(true)}
                >
                    {isTimelineOpen && (
                        <VersionTimelineDrawer
                            versions={versions}
                            isLoading={isLoadingVersions}
                            onClose={() => setIsTimelineOpen(false)}
                            onActivate={handleActivateVersion}
                            isActivating={isActivating}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Main Prompt Bar */}
            <div className={`
                bg-[#1a1d21] backdrop-blur-lg border border-white/10 shadow-2xl shadow-black/50 p-4
                ${isTimelineOpen ? "rounded-b-2xl border-t-0" : "rounded-2xl"}
            `}>
                {showPlanActions ? (
                    <div className="flex flex-col gap-4 rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-black/40 px-4 py-3 shadow-[0_0_30px_rgba(249,115,22,0.25)]">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-orange-300/80">
                            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
                            Approve plan
                        </div>
                        <div className="text-sm text-white/90">
                            Review the planned changes, then apply or keep refining.
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                onClick={onApprovePlan}
                                disabled={isGenerating}
                                className="rounded-xl bg-orange-500/90 hover:bg-orange-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.35)]"
                            >
                                Apply changes
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onKeepChatting}
                                disabled={isGenerating}
                                className="rounded-xl text-orange-100/70 hover:bg-orange-500/10"
                            >
                                Keep chatting
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* File Pills Row - Above Input */}
                        <AnimatePresence>
                            {uploadedFiles.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mb-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto"
                                >
                                    {uploadedFiles.map((file, index) => {
                                        const isImage = file.type.startsWith("image/");
                                        const previewKey = `${file.name}-${index}`;
                                        const preview = previewUrls.get(previewKey);

                                        return (
                                            <motion.div
                                                key={`pill-${file.name}-${index}`}
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                    y: -10,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                    y: 0,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                    y: -10,
                                                }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 h-10"
                                            >
                                                <div className="w-6 h-6 rounded overflow-hidden bg-[#0a0f14] flex items-center justify-center shrink-0">
                                                    {isImage && preview ? (
                                                        <img
                                                            src={preview}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Video className="w-4 h-4 text-white/40" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-white/70 truncate max-w-[150px]">
                                                    {file.name}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => onRemoveFile(index)}
                                                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors shrink-0"
                                                >
                                                    <X className="w-3 h-3 text-white/60 hover:text-red-400" />
                                                </motion.button>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Textarea */}
                        <Textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your portfolio refinement..."
                            disabled={isGenerating}
                            rows={1}
                            className="w-full min-h-[48px] max-h-[200px] resize-none bg-black/40 border-white/10 focus-visible:border-white/30 focus-visible:ring-white/10 text-white placeholder:text-white/40 mb-3"
                        />

                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-2">
                            {/* Attach Files Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleAttachClick}
                                className="rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-all"
                            >
                                <Paperclip className="w-4 h-4" />
                            </Button>

                            {/* Attach Styles Button (Placeholder) */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl text-slate-500 hover:bg-slate-800/30 cursor-default"
                                disabled
                            >
                                <Palette className="w-4 h-4" />
                            </Button>

                            {/* File Count Indicator */}
                            {uploadedFiles.length > 0 && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-xs text-slate-400 ml-1"
                                >
                                    {uploadedFiles.length} file(s)
                                </motion.span>
                            )}

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* View Mode Toggle */}
                            {onLayoutModeChange && (
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowViewMenu((prev) => !prev)}
                                        className="rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 transition-all"
                                        title="View modes"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    {showViewMenu && (
                                        <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-white/10 bg-[#111318] shadow-lg overflow-hidden">
                                            {[
                                                { value: "sidebar", label: "Sidebar chat", icon: PanelLeft },
                                                { value: "floating", label: "Floating chat", icon: MessageSquare },
                                                { value: "preview", label: "Preview only", icon: Monitor },
                                            ].map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => {
                                                        onLayoutModeChange(value as "sidebar" | "floating" | "preview");
                                                        setShowViewMenu(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                                                        layoutMode === value
                                                            ? "bg-white/10 text-white"
                                                            : "text-white/70 hover:bg-white/5"
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Download */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="icon"
                                    onClick={handleDownload}
                                    disabled={isDownloading || isGenerating}
                                    className="rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    title="Download HTML"
                                >
                                    {isDownloading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                </Button>
                            </motion.div>

                            {/* Send Button */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={
                                        isGenerating ||
                                        (!prompt.trim() && uploadedFiles.length === 0)
                                    }
                                    className="rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};
