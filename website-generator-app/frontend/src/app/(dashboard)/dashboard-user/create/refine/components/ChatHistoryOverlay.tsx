"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, ChevronDown } from "lucide-react";
import type { Message } from "@/types/preview";

interface ChatHistoryOverlayProps {
    messages: Message[];
    isGenerating: boolean;
}

export const ChatHistoryOverlay: React.FC<ChatHistoryOverlayProps> = ({
    messages,
    isGenerating,
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasEverMinimized, setHasEverMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (!isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isMinimized]);

    const handleMinimize = () => {
        setIsMinimized(true);
        setHasEverMinimized(true);
    };

    const handleMaximize = () => {
        setIsMinimized(false);
    };

    // Format timestamp (relative time)
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

    return (
        <>
            {/* Minimized Button at Top */}
            <AnimatePresence>
                {hasEverMinimized && isMinimized && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                        onClick={handleMaximize}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[45] w-12 h-12 bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl flex items-center justify-center hover:bg-black/90 hover:border-white/30 transition-colors shadow-xl"
                        aria-label="Show chat history"
                    >
                        <ChevronDown className="w-5 h-5 text-white/70" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main Chat Overlay */}
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={
                            hasEverMinimized
                                ? { opacity: 0, scale: 0.05, y: -400 }
                                : { opacity: 0, scale: 0.95, y: 20 }
                        }
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            scale: 0.05,
                            opacity: 0,
                            y: -400,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                            scale: {
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            },
                        }}
                        style={{ transformOrigin: "top center" }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-[90vw] max-h-[600px] z-40 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        role="dialog"
                        aria-label="Chat History"
                    >
                        {/* Header with Minimize Button */}
                        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                            <button
                                onClick={handleMinimize}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Minimize chat history"
                            >
                                <Minus className="w-4 h-4" />
                            </button>

                            <span className="text-sm font-medium text-white/70">
                                Chat History
                            </span>

                            <div className="w-8" /> {/* Spacer for symmetry */}
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex flex-col ${
                                        message.role === "user"
                                            ? "items-end"
                                            : "items-start"
                                    }`}
                                >
                                    {message.role === "user" ? (
                                        /* User Message - Blue Bubble */
                                        <div className="flex flex-col items-end max-w-[80%]">
                                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm rounded-full px-4 py-2 leading-relaxed">
                                                {message.content}
                                            </div>
                                            <span className="text-xs text-white/40 mt-1">
                                                {formatTimestamp(
                                                    message.timestamp,
                                                )}
                                            </span>
                                        </div>
                                    ) : (
                                        /* AI Message - Plain Text */
                                        <div className="flex flex-col items-start max-w-[85%]">
                                            <div className="text-white/90 text-sm leading-relaxed">
                                                {message.content}
                                            </div>
                                            <span className="text-xs text-white/40 mt-1">
                                                {formatTimestamp(
                                                    message.timestamp,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-1 items-center"
                                >
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                        }}
                                        className="w-2 h-2 bg-white/40 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            delay: 0.2,
                                        }}
                                        className="w-2 h-2 bg-white/40 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            delay: 0.4,
                                        }}
                                        className="w-2 h-2 bg-white/40 rounded-full"
                                    />
                                </motion.div>
                            )}

                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
