"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronUp, History } from "lucide-react";

interface VersionTimelineTriggerProps {
    isOpen?: boolean;
    onClick: () => void;
}

/**
 * Compact tab that opens the prompt bar version history panel.
 */
export const VersionTimelineTrigger: React.FC<VersionTimelineTriggerProps> = ({
    isOpen = false,
    onClick,
}) => {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-expanded={isOpen}
            className="mb-[-1px] inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-t-2xl border border-b-0 border-border bg-card/95 px-3 text-xs font-medium text-muted-foreground shadow-[0_14px_40px_rgba(0,0,0,0.10)] backdrop-blur-2xl transition-colors hover:cursor-pointer hover:bg-muted hover:text-foreground dark:border-white/10 dark:bg-[#1c1d22]/92 dark:text-white/70 dark:shadow-[0_16px_48px_rgba(0,0,0,0.30)] dark:hover:bg-white/[0.06] dark:hover:text-white"
            whileTap={{ scale: 0.95 }}
        >
            <History className="h-3.5 w-3.5" />
            <span>Version history</span>
            <ChevronUp className="h-3.5 w-3.5" />
        </motion.button>
    );
};
