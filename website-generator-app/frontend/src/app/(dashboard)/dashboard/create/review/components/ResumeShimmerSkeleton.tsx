"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        className={cn(
            "rounded-full bg-[linear-gradient(110deg,rgba(24,24,27,0.06),35%,rgba(24,24,27,0.14),50%,rgba(24,24,27,0.06))] bg-[length:200%_100%] dark:bg-[linear-gradient(110deg,rgba(255,255,255,0.04),35%,rgba(255,255,255,0.13),50%,rgba(255,255,255,0.04))]",
            className,
        )}
        style={style}
        animate={shimmerAnimation}
        transition={shimmerTransition}
    />
);

const SkeletonCard: React.FC<{
    children: React.ReactNode;
    delay: number;
    className?: string;
}> = ({ children, delay, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={cn(
            "rounded-[28px] border border-border bg-muted/60 p-8 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-black/85 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(255,255,255,0.06)]",
            className,
        )}
    >
        {children}
    </motion.div>
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
            <SkeletonCard delay={0.1}>
                {/* Name skeleton */}
                <div className="mb-6 border-b border-border pb-6 text-center dark:border-white/10">
                    <ShimmerBar className="mx-auto h-10 w-64" />
                </div>

                {/* Contact info grid skeleton */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center rounded-2xl border border-border bg-muted/50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                            <ShimmerBar className="mb-2 h-4 w-16" />
                            <ShimmerBar className="h-5 w-32" />
                        </div>
                    ))}
                </div>

                {/* Summary skeleton */}
                <div className="mt-6 border-t border-border pt-6 dark:border-white/10">
                    <ShimmerBar className="mb-3 h-4 w-20" />
                    <div className="space-y-2">
                        <ShimmerBar className="h-4 w-full" />
                        <ShimmerBar className="h-4 w-full" />
                        <ShimmerBar className="h-4 w-3/4" />
                    </div>
                </div>
            </SkeletonCard>

            {/* Skills Section Skeleton */}
            <SkeletonCard delay={0.2}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl border border-border bg-muted/50 p-2 dark:border-white/10 dark:bg-white/[0.04]">
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
            </SkeletonCard>

            {/* Experience Section Skeleton */}
            <SkeletonCard delay={0.3}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl border border-border bg-muted/50 p-2 dark:border-white/10 dark:bg-white/[0.04]">
                        <ShimmerBar className="h-5 w-5" />
                    </div>
                    <ShimmerBar className="h-7 w-36" />
                </div>

                <div className="space-y-6">
                    {[1, 2].map((expIndex) => (
                        <div
                            key={expIndex}
                            className="border-l border-border pb-6 pl-6 last:pb-0 dark:border-white/10"
                        >
                            <ShimmerBar className="mb-2 h-6 w-48" />
                            <ShimmerBar className="mb-1 h-5 w-36" />
                            <ShimmerBar className="mb-4 h-4 w-32" />

                            <div className="space-y-2 mt-4">
                                {[1, 2, 3].map((bulletIndex) => (
                                    <div
                                        key={bulletIndex}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="mt-1.5 text-muted-foreground/30">
                                            &bull;
                                        </span>
                                        <ShimmerBar className="h-4 flex-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SkeletonCard>

            {/* Education Section Skeleton */}
            <SkeletonCard delay={0.4}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl border border-border bg-muted/50 p-2 dark:border-white/10 dark:bg-white/[0.04]">
                        <ShimmerBar className="h-5 w-5" />
                    </div>
                    <ShimmerBar className="h-7 w-24" />
                </div>

                <div className="space-y-6">
                    <div className="border-l border-border pl-6 dark:border-white/10">
                        <ShimmerBar className="mb-2 h-6 w-56" />
                        <ShimmerBar className="mb-1 h-5 w-40" />
                        <ShimmerBar className="h-4 w-32" />
                    </div>
                </div>
            </SkeletonCard>
        </div>
    );
};

ResumeShimmerSkeleton.displayName = "ResumeShimmerSkeleton";
