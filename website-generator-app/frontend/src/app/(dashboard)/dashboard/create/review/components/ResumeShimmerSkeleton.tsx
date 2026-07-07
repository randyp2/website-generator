"use client";

import React from "react";
import { motion } from "framer-motion";

const shimmerAnimation = {
    backgroundPosition: ["-200% 0", "200% 0"],
};

const shimmerTransition = {
    repeat: Infinity,
    duration: 1.5,
    ease: "linear" as const,
};

const ShimmerBar: React.FC<{
    className?: string;
    style?: React.CSSProperties;
}> = ({ className, style }) => (
    <motion.div
        className={`bg-[linear-gradient(110deg,rgba(255,255,255,0.05),35%,rgba(255,255,255,0.15),50%,rgba(255,255,255,0.05))] bg-[length:200%_100%] rounded ${className}`}
        style={style}
        animate={shimmerAnimation}
        transition={shimmerTransition}
    />
);

/**
 * Shimmer skeleton component for the review page
 * Displays while resume is being parsed in the background
 */
export const ResumeShimmerSkeleton: React.FC = () => {
    const skillPillWidths = [64, 88, 76, 96, 72, 84, 68, 92];

    return (
        <div className="space-y-6">
            {/* Personal Information Section Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-zinc-200/90 via-zinc-100/90 to-zinc-200/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border dark:border-white/10"
            >
                {/* Name skeleton */}
                <div className="text-center border-b border-border dark:border-white/10 pb-6 mb-6">
                    <ShimmerBar className="h-10 w-64 mx-auto" />
                </div>

                {/* Contact info grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-border dark:border-white/10"
                        >
                            <ShimmerBar className="h-4 w-16 mb-2" />
                            <ShimmerBar className="h-5 w-32" />
                        </div>
                    ))}
                </div>

                {/* Summary skeleton */}
                <div className="mt-6 pt-6 border-t border-border dark:border-white/10">
                    <ShimmerBar className="h-4 w-20 mb-3" />
                    <div className="space-y-2">
                        <ShimmerBar className="h-4 w-full" />
                        <ShimmerBar className="h-4 w-full" />
                        <ShimmerBar className="h-4 w-3/4" />
                    </div>
                </div>
            </motion.div>

            {/* Skills Section Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-zinc-200/90 via-zinc-100/90 to-zinc-200/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border dark:border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-sky-100/20 rounded-lg">
                        <ShimmerBar className="h-5 w-5" />
                    </div>
                    <ShimmerBar className="h-7 w-20" />
                </div>

                <div className="flex flex-wrap gap-3">
                    {skillPillWidths.map((width, i) => (
                        <ShimmerBar
                            key={i}
                            className="h-8 rounded-full"
                            style={{ width } as React.CSSProperties}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Experience Section Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-zinc-200/90 via-zinc-100/90 to-zinc-200/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border dark:border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-sky-100/20 rounded-lg">
                        <ShimmerBar className="h-5 w-5" />
                    </div>
                    <ShimmerBar className="h-7 w-36" />
                </div>

                <div className="space-y-6">
                    {[1, 2].map((expIndex) => (
                        <div
                            key={expIndex}
                            className="border-l-4 border-sky-500/30 pl-6 pb-6 last:pb-0"
                        >
                            <ShimmerBar className="h-6 w-48 mb-2" />
                            <ShimmerBar className="h-5 w-36 mb-1" />
                            <ShimmerBar className="h-4 w-32 mb-4" />

                            <div className="space-y-2 mt-4">
                                {[1, 2, 3].map((bulletIndex) => (
                                    <div
                                        key={bulletIndex}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-sky-400/30 mt-1.5">
                                            &bull;
                                        </span>
                                        <ShimmerBar className="h-4 flex-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Education Section Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-zinc-200/90 via-zinc-100/90 to-zinc-200/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border dark:border-white/10"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-sky-100/20 rounded-lg">
                        <ShimmerBar className="h-5 w-5" />
                    </div>
                    <ShimmerBar className="h-7 w-24" />
                </div>

                <div className="space-y-6">
                    <div className="border-l-4 border-purple-500/30 pl-6">
                        <ShimmerBar className="h-6 w-56 mb-2" />
                        <ShimmerBar className="h-5 w-40 mb-1" />
                        <ShimmerBar className="h-4 w-32" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

ResumeShimmerSkeleton.displayName = "ResumeShimmerSkeleton";
