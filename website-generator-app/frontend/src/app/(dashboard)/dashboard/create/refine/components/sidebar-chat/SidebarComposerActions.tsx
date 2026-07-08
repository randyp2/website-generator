"use client";

import React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatLayoutMode } from "./types";

interface SidebarComposerActionsProps {
    uploadedFilesCount: number;
    isGenerating: boolean;
    isDownloading: boolean;
    layoutMode: ChatLayoutMode;
    showViewMenu: boolean;
    canSend: boolean;
    hasLayoutModeChange: boolean;
    onAttachClick: () => void;
    onToggleViewMenu: () => void;
    onLayoutModeChange: (mode: ChatLayoutMode) => void;
    onDownload: () => void;
    onSend: () => void;
}

const VIEW_MODES: {
    value: ChatLayoutMode;
    label: string;
    icon: React.ElementType;
}[] = [
    { value: "sidebar", label: "Sidebar chat", icon: PanelLeft },
    { value: "floating", label: "Floating chat", icon: MessageSquare },
    { value: "preview", label: "Preview only", icon: Monitor },
];

export const SidebarComposerActions: React.FC<SidebarComposerActionsProps> = ({
    uploadedFilesCount,
    isGenerating,
    isDownloading,
    layoutMode,
    showViewMenu,
    canSend,
    hasLayoutModeChange,
    onAttachClick,
    onToggleViewMenu,
    onLayoutModeChange,
    onDownload,
    onSend,
}) => (
    <div className="flex items-center gap-2">
        <ActionIconButton onClick={onAttachClick} title="Attach files">
            <Paperclip className="h-4 w-4" />
        </ActionIconButton>

        <ActionIconButton
            disabled
            className="cursor-default text-muted-foreground/60 dark:text-slate-500"
            title="Attach styles"
        >
            <Palette className="h-4 w-4" />
        </ActionIconButton>

        {uploadedFilesCount > 0 && (
            <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-1 text-xs text-muted-foreground dark:text-slate-400"
            >
                {uploadedFilesCount} file(s)
            </motion.span>
        )}

        <div className="flex-1" />

        {hasLayoutModeChange && (
            <ViewModeMenu
                layoutMode={layoutMode}
                isOpen={showViewMenu}
                onToggle={onToggleViewMenu}
                onSelect={onLayoutModeChange}
            />
        )}

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ActionIconButton
                onClick={onDownload}
                disabled={isDownloading || isGenerating}
                title="Download HTML"
            >
                {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
            </ActionIconButton>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ActionIconButton
                onClick={onSend}
                disabled={isGenerating || !canSend}
                title="Send refinement"
            >
                <Send className="h-4 w-4" />
            </ActionIconButton>
        </motion.div>
    </div>
);

interface ViewModeMenuProps {
    layoutMode: ChatLayoutMode;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (mode: ChatLayoutMode) => void;
}

const ViewModeMenu: React.FC<ViewModeMenuProps> = ({
    layoutMode,
    isOpen,
    onToggle,
    onSelect,
}) => (
    <div className="relative">
        <ActionIconButton onClick={onToggle} title="View modes">
            <Eye className="h-4 w-4" />
        </ActionIconButton>
        {isOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-40 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg dark:border-white/10 dark:bg-[#111318]">
                {VIEW_MODES.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => onSelect(value)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                            layoutMode === value
                                ? "bg-muted text-foreground dark:bg-white/10 dark:text-white"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-white/70 dark:hover:bg-white/5"
                        }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </button>
                ))}
            </div>
        )}
    </div>
);

interface ActionIconButtonProps
    extends React.ComponentPropsWithoutRef<typeof Button> {
    children: React.ReactNode;
}

const ActionIconButton: React.FC<ActionIconButtonProps> = ({
    children,
    className = "",
    ...props
}) => (
    <Button
        variant="ghost"
        size="icon"
        className={`rounded-xl bg-transparent text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-300 ${className}`}
        {...props}
    >
        {children}
    </Button>
);
