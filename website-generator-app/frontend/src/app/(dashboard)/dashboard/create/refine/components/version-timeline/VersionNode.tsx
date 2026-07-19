"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Version } from "@/types/version";

interface VersionNodeProps {
    version: Version;
    index: number;
    total: number;
    onActivate: (versionId: string) => void;
    isActivating: boolean;
}

/**
 * Single saved version row inside the refine version history panel.
 */
export const VersionNode: React.FC<VersionNodeProps> = ({
    version,
    index,
    total,
    onActivate,
    isActivating,
}) => {
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getPromptSnippet = (prompt: string | null, maxLength = 72) => {
        if (!prompt) return "Initial generation";
        return prompt.length > maxLength
            ? `${prompt.slice(0, maxLength)}...`
            : prompt;
    };

    const isActive = version.is_active;
    const isLast = index === total - 1;

    return (
        <motion.div className="relative">
            {!isLast && (
                <span
                    aria-hidden="true"
                    className="absolute left-[1.125rem] top-9 h-[calc(100%-1.25rem)] w-px bg-border dark:bg-white/10"
                />
            )}

            <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.16 }}
                disabled={isActive || isActivating}
                onClick={() => onActivate(version.id)}
                className={cn(
                    "group relative flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-colors duration-150",
                    isActive
                        ? "cursor-default border-border bg-muted/70 shadow-sm dark:border-white/10 dark:bg-white/[0.07]"
                        : "cursor-pointer border-transparent hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                )}
            >
                <span
                    className={cn(
                        "relative z-10 mt-1 flex h-3 w-3 shrink-0 items-center justify-center rounded-full ring-4",
                        isActive
                            ? "bg-primary text-primary-foreground ring-primary/20 shadow-[0_0_18px_rgba(245,158,11,0.28)]"
                            : "bg-muted-foreground/40 ring-background transition-colors group-hover:bg-primary group-hover:ring-primary/20 dark:bg-white/40 dark:ring-[#1c1d22]",
                    )}
                >
                    {isActive && <Check className="h-2 w-2" strokeWidth={3} />}
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className={cn(
                                "truncate text-sm font-medium",
                                isActive
                                    ? "text-foreground dark:text-white"
                                    : "text-foreground/80 transition-colors group-hover:text-primary dark:text-white/80 dark:group-hover:text-primary",
                            )}
                        >
                            Version {index + 1}
                        </span>
                        {isActive && (
                            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary dark:bg-primary/20 dark:text-primary">
                                Current
                            </span>
                        )}
                        {version.is_published && (
                            <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                                Live
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground transition-colors group-hover:text-primary/80 dark:text-white/50 dark:group-hover:text-primary/80">
                        {formatTime(version.created_at)}
                    </p>
                    <p
                        className={cn(
                            "mt-1 truncate text-xs",
                            isActive
                                ? "text-muted-foreground dark:text-white/60"
                                : "text-muted-foreground/80 transition-colors group-hover:text-primary/75 dark:text-white/40 dark:group-hover:text-primary/75",
                        )}
                    >
                        {getPromptSnippet(version.prompt_used)}
                    </p>
                </div>

                {!isActive && (
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition group-hover:cursor-pointer group-hover:opacity-100 group-hover:text-primary dark:text-white/50 dark:group-hover:text-primary">
                        <RotateCcw className="h-3.5 w-3.5" />
                    </span>
                )}
            </motion.button>
        </motion.div>
    );
};
