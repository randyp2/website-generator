"use client";

import type { RefObject } from "react";
import { motion } from "framer-motion";
import { GenerationStatus } from "@/components/ui/GenerationStatus";
import { StreamingText } from "@/components/ui/StreamingText";
import type { ChatMessage } from "./types";
import { formatTimestamp } from "./sidebarChatUtils";
import { RefinePlanCard } from "./RefinePlanCard";

interface SidebarChatMessagesProps {
    messages: ChatMessage[];
    completedStreamingIds: Set<string>;
    messagesEndRef: RefObject<HTMLDivElement | null>;
    onStreamingComplete: (messageId: string) => void;
}

export const SidebarChatMessages: React.FC<SidebarChatMessagesProps> = ({
    messages,
    completedStreamingIds,
    messagesEndRef,
    onStreamingComplete,
}) => (
    <div className="flex-1 space-y-4 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 dark:[&::-webkit-scrollbar-thumb]:hover:bg-white/20">
        {messages.map((message) => (
            <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                }`}
            >
                {message.role === "user" ? (
                    <UserChatMessage message={message} />
                ) : (
                    <AssistantChatMessage
                        message={message}
                        completedStreamingIds={completedStreamingIds}
                        onStreamingComplete={onStreamingComplete}
                    />
                )}
            </motion.div>
        ))}

        <div ref={messagesEndRef} />
    </div>
);

const UserChatMessage = ({ message }: { message: ChatMessage }) => (
    <div className="flex max-w-[85%] flex-col items-end">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm leading-relaxed text-white">
            {message.content}
        </div>
        <span className="mt-1 text-xs text-muted-foreground dark:text-white/40">
            {formatTimestamp(message.timestamp)}
        </span>
    </div>
);

interface AssistantChatMessageProps {
    message: ChatMessage;
    completedStreamingIds: Set<string>;
    onStreamingComplete: (messageId: string) => void;
}

const AssistantChatMessage: React.FC<AssistantChatMessageProps> = ({
    message,
    completedStreamingIds,
    onStreamingComplete,
}) => (
    <div className="flex max-w-[90%] flex-col items-start">
        <div className="text-sm leading-relaxed text-foreground/90 dark:text-white/90">
            {message.isGenerating ? (
                <GenerationStatus />
            ) : message.messageType === "plan" && message.sectionPlans ? (
                <RefinePlanCard
                    summary={message.planSummary}
                    plans={message.sectionPlans}
                />
            ) : (
                <StreamingText
                    content={message.content}
                    className="whitespace-pre-line"
                    delayMs={30}
                    skipAnimation={completedStreamingIds.has(message.id)}
                    onComplete={() => onStreamingComplete(message.id)}
                />
            )}
        </div>
        <span className="mt-1 text-xs text-muted-foreground dark:text-white/40">
            {formatTimestamp(message.timestamp)}
        </span>
    </div>
);
