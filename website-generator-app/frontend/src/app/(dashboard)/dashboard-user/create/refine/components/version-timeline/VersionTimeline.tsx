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

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
    versions,
    isLoading,
    onActivate,
    isActivating,
}) => {
    // Loading skeleton
    if (isLoading) {
        return (
            <div className="p-3 space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-20 bg-slate-700 rounded" />
                            <div className="h-2 w-32 bg-slate-700/50 rounded" />
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
                className="flex flex-col items-center justify-center py-8 px-4"
            >
                <p className="text-sm text-white/40 text-center">
                    No versions yet
                </p>
            </motion.div>
        );
    }

    return (
        <div className="p-2">
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
