"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Version } from "@/types/version";

interface VersionNodeProps {
    version: Version;
    index: number;
    total: number;
    onActivate: (versionId: string) => void;
    isActivating: boolean;
}

export const VersionNode: React.FC<VersionNodeProps> = ({
    version,
    index,
    onActivate,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getPromptSnippet = (prompt: string | null, maxLength = 60) => {
        if (!prompt) return "Initial generation";
        return prompt.length > maxLength
            ? `${prompt.slice(0, maxLength)}...`
            : prompt;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.15 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors duration-150 cursor-pointer
                ${version.is_active
                    ? "bg-white/10 border border-white/20 shadow-[0_0_18px_rgba(255,255,255,0.18)]"
                    : isHovered
                        ? "bg-white/5 ring-1 ring-white/10"
                        : ""
                }
            `}
            onClick={() => !version.is_active && onActivate(version.id)}
        >
            {/* Left indicator dot */}
            <div
                className={`
                    w-2 h-2 rounded-full shrink-0
                    ${version.is_active
                        ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                        : "bg-slate-500"
                    }
                `}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-sm font-medium ${
                            version.is_active ? "text-white" : "text-white/80"
                        }`}
                    >
                        Version {index + 1}
                    </span>
                    {version.is_active && (
                        <span className="text-[10px] uppercase tracking-wider text-white/80 bg-white/15 px-1.5 py-0.5 rounded">
                            Current
                        </span>
                    )}
                </div>
                <p className="text-xs text-white/40 mt-0.5">
                    {formatTime(version.created_at)}
                </p>
                {version.prompt_used && (
                    <p className="text-xs text-white/30 mt-1 truncate">
                        {getPromptSnippet(version.prompt_used)}
                    </p>
                )}
            </div>

        </motion.div>
    );
};
