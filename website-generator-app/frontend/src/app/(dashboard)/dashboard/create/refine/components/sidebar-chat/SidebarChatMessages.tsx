"use client";

import type { RefObject } from "react";
import { StyleChatMessage } from "@/components/chat/style-chat/StyleChatMessage";
import type { ChatMessage } from "./types";

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
    <div className="flex-1 space-y-5 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 dark:[&::-webkit-scrollbar-thumb]:hover:bg-white/20">
        {messages.map((message) => (
            <StyleChatMessage
                key={message.id}
                message={message}
                streamPlainText
                showFlowStateStatus
                skipAnimation={completedStreamingIds.has(message.id)}
                onStreamingComplete={onStreamingComplete}
            />
        ))}

        <div ref={messagesEndRef} />
    </div>
);
