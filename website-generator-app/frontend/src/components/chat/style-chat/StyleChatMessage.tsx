"use client";

import { GenerationStatus } from "@/components/ui/GenerationStatus";
import { StreamingText } from "@/components/ui/StreamingText";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/preview";
import { AiMessageContent } from "./AiMessageContent";
import { FlowStateStatus } from "./FlowStateStatus";
import { RefinePlanCard } from "./RefinePlanCard";
import { StyleSummaryCard } from "./StyleSummaryCard";

/**
 * Formats a message timestamp for compact chat display.
 */
export const formatChatTimestamp = (date: Date) => {
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
    onSuggestionClick?: (suggestion: string) => void;
    onLayoutSelect?: (layout: string) => void;
    streamPlainText?: boolean;
    showFlowStateStatus?: boolean;
    skipAnimation?: boolean;
    onStreamingComplete?: (messageId: string) => void;
}

/**
 * Shared chat message renderer for style chat and portfolio refine chat.
 */
export const StyleChatMessage = ({
    message,
    onSuggestionClick,
    onLayoutSelect,
    streamPlainText = false,
    showFlowStateStatus = false,
    skipAnimation = false,
    onStreamingComplete,
}: StyleChatMessageProps) => {
    const hasPlainAiContent =
        message.role === "ai" &&
        !message.designTip &&
        !message.suggestions?.length &&
        !message.previewType &&
        !message.isStyleComplete &&
        !(message.messageType === "plan" && message.sectionPlans);

    return (
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
                    message.role === "ai" &&
                        (message.previewType || message.sectionPlans)
                        ? "max-w-full"
                        : message.role === "ai"
                          ? "max-w-[88%] md:max-w-[80%]"
                          : "",
                )}
            >
                {message.role === "ai" ? (
                    message.isGenerating ? (
                        showFlowStateStatus ? (
                            <FlowStateStatus startedAt={message.timestamp} />
                        ) : (
                            <GenerationStatus
                                statusText={message.content || undefined}
                            />
                        )
                    ) : message.messageType === "plan" &&
                      message.sectionPlans ? (
                        <RefinePlanCard
                            summary={message.planSummary}
                            plans={message.sectionPlans}
                        />
                    ) : message.isStyleComplete ? (
                        <StyleSummaryCard
                            content={message.content}
                            stylePreferences={message.stylePreferences}
                            updatedFields={message.updatedStyleFields}
                        />
                    ) : streamPlainText && hasPlainAiContent ? (
                        <StreamingText
                            content={message.content}
                            className="whitespace-pre-line"
                            delayMs={30}
                            skipAnimation={skipAnimation}
                            onComplete={() => onStreamingComplete?.(message.id)}
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
                {formatChatTimestamp(message.timestamp)}
            </span>
        </div>
    );
};
