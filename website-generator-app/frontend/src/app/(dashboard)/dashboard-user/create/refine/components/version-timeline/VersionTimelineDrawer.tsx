"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Version } from "@/types/version";
import { VersionTimeline } from "./VersionTimeline";

interface VersionTimelineDrawerProps {
    versions: Version[];
    isLoading: boolean;
    onClose: () => void;
    onActivate: (versionId: string) => void;
    isActivating: boolean;
}

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
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full flex flex-col items-center overflow-hidden"
        >
            <div className="
                w-full overflow-hidden
                bg-[#1a1d21] backdrop-blur-lg
                border-x border-t border-white/10
            ">
                <div className="max-h-72 overflow-y-auto
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-white/10
                    [&::-webkit-scrollbar-thumb]:rounded-full
                ">
                    <div className="sticky top-0 px-4 py-3 bg-[#1a1d21] border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                            Version History
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-6 h-6 rounded-full bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                            aria-label="Close version history"
                        >
                            <X className="w-3.5 h-3.5" />
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
