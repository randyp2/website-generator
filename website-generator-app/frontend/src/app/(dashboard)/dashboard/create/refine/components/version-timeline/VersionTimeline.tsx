"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Version } from "@/types/version";
import { VersionNode } from "./VersionNode";

interface VersionTimelineProps {
    versions: Version[];
    isLoading: boolean;
    onActivate: (versionId: string) => void;
    isActivating: boolean;
}

/**
 * Version history list with loading and empty states.
 */
export const VersionTimeline: React.FC<VersionTimelineProps> = ({
    versions,
    isLoading,
    onActivate,
    isActivating,
}) => {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex animate-pulse items-center gap-3 rounded-2xl px-3 py-2.5"
                    >
                        <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20 dark:bg-white/15" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 rounded-full bg-muted-foreground/20 dark:bg-white/15" />
                            <div className="h-2.5 w-40 rounded-full bg-muted-foreground/10 dark:bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty state
    if (versions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center px-4 py-8"
            >
                <p className="text-center text-sm text-muted-foreground dark:text-white/50">
                    No versions yet
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-1 p-2.5">
            {versions.map((version, index) => (
                <VersionNode
                    key={version.id}
                    version={version}
                    index={index}
                    total={versions.length}
                    onActivate={onActivate}
                    isActivating={isActivating}
                />
            ))}
        </div>
    );
};
