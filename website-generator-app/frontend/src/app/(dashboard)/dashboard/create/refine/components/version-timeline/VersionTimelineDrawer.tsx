"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { History, X } from "lucide-react";
import type { Version } from "@/types/version";
import { VersionTimeline } from "./VersionTimeline";

interface VersionTimelineDrawerProps {
    versions: Version[];
    isLoading: boolean;
    onClose: () => void;
    onActivate: (versionId: string) => void;
    isActivating: boolean;
}

/**
 * Rounded version history panel anchored above the refine prompt bar.
 */
export const VersionTimelineDrawer: React.FC<VersionTimelineDrawerProps> = ({
    versions,
    isLoading,
    onClose,
    onActivate,
    isActivating,
}) => {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                drawerRef.current &&
                !drawerRef.current.contains(event.target as Node)
            ) {
                // Check if click was on the trigger button (to avoid double toggle)
                const target = event.target as HTMLElement;
                if (target.closest("[data-version-trigger]")) {
                    return;
                }
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            ref={drawerRef}
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className="flex w-full flex-col items-center overflow-hidden px-1 pb-3"
        >
            <div className="w-full overflow-hidden rounded-3xl border border-border bg-card/95 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#1c1d22]/92 dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="max-h-72 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 dark:[&::-webkit-scrollbar-thumb]:hover:bg-white/20">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-card/95 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-[#1c1d22]/95">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground dark:bg-white/[0.06] dark:text-white/70">
                                <History className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-medium text-foreground dark:text-white">
                                    Version history
                                </h3>
                                <p className="text-xs text-muted-foreground dark:text-white/50">
                                    {versions.length} saved{" "}
                                    {versions.length === 1 ? "version" : "versions"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:cursor-pointer hover:bg-muted hover:text-foreground dark:text-white/60 dark:hover:bg-white/[0.07] dark:hover:text-white"
                            aria-label="Close version history"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <VersionTimeline
                        versions={versions}
                        isLoading={isLoading}
                        onActivate={onActivate}
                        isActivating={isActivating}
                    />
                </div>
            </div>
        </motion.div>
    );
};
