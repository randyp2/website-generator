"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/preview";
import { AiMessageContent } from "./AiMessageContent";
import { StyleSummaryCard } from "./StyleSummaryCard";

const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};

interface StyleChatMessageProps {
    message: Message;
    onSuggestionClick: (suggestion: string) => void;
    onLayoutSelect?: (layout: string) => void;
}

export const StyleChatMessage = ({
    message,
    onSuggestionClick,
    onLayoutSelect,
}: StyleChatMessageProps) => (
    <div
        className={cn(
            "flex flex-col",
            message.role === "user" ? "items-end" : "items-start",
        )}
    >
        <div
            className={cn(
                "py-3 text-[15px] leading-relaxed",
                message.role === "user"
                    ? "max-w-[88%] rounded-full bg-muted px-6 py-3.5 text-foreground ring-1 ring-border md:max-w-[80%] dark:bg-zinc-800 dark:text-zinc-100 dark:ring-white/10"
                    : "text-foreground/90 dark:text-white/90",
                message.role === "ai" && message.previewType
                    ? "max-w-full"
                    : message.role === "ai"
                      ? "max-w-[88%] md:max-w-[80%]"
                      : "",
            )}
        >
            {message.role === "ai" ? (
                message.isStyleComplete ? (
                    <StyleSummaryCard
                        content={message.content}
                        stylePreferences={message.stylePreferences}
                        updatedFields={message.updatedStyleFields}
                    />
                ) : (
                    <AiMessageContent
                        message={message}
                        onSuggestionClick={onSuggestionClick}
                        onLayoutSelect={onLayoutSelect}
                    />
                )
            ) : (
                message.content
            )}
        </div>
        <span className="mt-1 text-xs text-muted-foreground dark:text-white/40">
            {formatTimestamp(message.timestamp)}
        </span>
    </div>
);
