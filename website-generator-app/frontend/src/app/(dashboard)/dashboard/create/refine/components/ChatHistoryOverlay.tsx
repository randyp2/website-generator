"use client";

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, ChevronDown } from "lucide-react";
import Draggable from "react-draggable";
import type { Message as PreviewMessage } from "@/types/preview";
import { GenerationStatus } from "@/components/ui/GenerationStatus";
import { StreamingText } from "@/components/ui/StreamingText";

type ChatMessage = PreviewMessage & { isGenerating?: boolean };

interface ChatHistoryOverlayProps {
    messages: ChatMessage[];
    isGenerating: boolean;
}

export const ChatHistoryOverlay: React.FC<ChatHistoryOverlayProps> = ({
    messages,
}) => {
    const defaultSize = { width: 800, height: 600 };
    const minimizedSize = { width: 220, height: 56 };
    const getCenteredPosition = (targetSize: {
        width: number;
        height: number;
    }) => {
        if (typeof window === "undefined") return { x: 0, y: 0 };
        return {
            x: (window.innerWidth - targetSize.width) / 2,
            y: (window.innerHeight - targetSize.height) / 2,
        };
    };
    const initialPosition = getCenteredPosition(defaultSize);
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasEverMinimized, setHasEverMinimized] = useState(false);
    const [completedStreamingIds, setCompletedStreamingIds] = useState<
        Set<string>
    >(new Set());
    const [size, setSize] = useState(defaultSize);
    const [position, setPosition] = useState(initialPosition);
    const [isResizing, setIsResizing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
    const normalSizeRef = useRef(defaultSize);
    const normalPositionRef = useRef(initialPosition);
    const transitionTimeoutRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const resizeStartRef = useRef<{
        width: number;
        height: number;
        x: number;
        y: number;
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const getMinimizedPosition = (targetSize: {
        width: number;
        height: number;
    }) => ({
        x: Math.max(0, (window.innerWidth - targetSize.width) / 2),
        y: 16,
    });

    // Load completed streaming IDs from localStorage on mount
    useEffect(() => {
        if (!hasLoadedFromStorage.current) {
            hasLoadedFromStorage.current = true;
            const stored = localStorage.getItem("completedStreamingIds");
            if (stored) {
                try {
                    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading from localStorage on mount to avoid hydration errors
                    setCompletedStreamingIds(new Set(JSON.parse(stored)));
                } catch {
                    // Ignore errors parsing localStorage
                }
            }
        }
    }, []);

    // Auto-scroll to latest message
    useEffect(() => {
        if (!isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isMinimized]);

    // Persist completed streaming IDs to localStorage
    useEffect(() => {
        // Only save after initial load to avoid overwriting stored data
        if (hasLoadedFromStorage.current) {
            localStorage.setItem(
                "completedStreamingIds",
                JSON.stringify(Array.from(completedStreamingIds)),
            );
        }
    }, [completedStreamingIds]);

    const handleMinimize = () => {
        setHasEverMinimized(true);
        normalSizeRef.current = size;
        normalPositionRef.current = position;
        const targetPosition = getMinimizedPosition(minimizedSize);
        setSize(minimizedSize);
        setPosition(targetPosition);
        setIsTransitioning(true);
        setIsMinimized(true);

        // Mark all non-generating AI messages as completed to prevent re-animation
        const newCompletedIds = new Set(completedStreamingIds);
        messages.forEach((message) => {
            if (message.role !== "user" && !message.isGenerating) {
                newCompletedIds.add(message.id);
            }
        });
        setCompletedStreamingIds(newCompletedIds);
    };

    const handleMaximize = () => {
        setSize(normalSizeRef.current);
        setPosition(normalPositionRef.current);
        setIsTransitioning(true);
        setIsMinimized(false);
    };

    const handleStreamingComplete = (messageId: string) => {
        setCompletedStreamingIds((prev) => new Set(prev).add(messageId));
    };

    const draggableNodeRef = useRef<HTMLDivElement>(null);
    const hasLoadedFromStorage = useRef(false);

    // Resize handlers
    const resizeDirectionRef = useRef<string>("");

    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        if (isMinimized) return;
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizeDirectionRef.current = direction;
        resizeStartRef.current = {
            width: size.width,
            height: size.height,
            x: position.x,
            y: position.y,
            mouseX: e.clientX,
            mouseY: e.clientY,
        };
    };

    useEffect(() => {
        if (!isResizing || !draggableNodeRef.current) return;

        const overlay = draggableNodeRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            if (!resizeStartRef.current) return;

            const deltaX = e.clientX - resizeStartRef.current.mouseX;
            const deltaY = e.clientY - resizeStartRef.current.mouseY;

            let newWidth = resizeStartRef.current.width;
            let newHeight = resizeStartRef.current.height;
            let newX = resizeStartRef.current.x;
            let newY = resizeStartRef.current.y;

            const direction = resizeDirectionRef.current;

            // Handle resize from right edge
            if (direction.includes("e")) {
                newWidth = Math.max(
                    400,
                    Math.min(
                        window.innerWidth * 0.9,
                        resizeStartRef.current.width + deltaX,
                    ),
                );
            }

            // Handle resize from left edge
            if (direction.includes("w")) {
                const potentialWidth = resizeStartRef.current.width - deltaX;
                if (
                    potentialWidth >= 400 &&
                    potentialWidth <= window.innerWidth * 0.9
                ) {
                    newWidth = potentialWidth;
                    newX = resizeStartRef.current.x + deltaX;
                }
            }

            // Handle resize from bottom edge
            if (direction.includes("s")) {
                newHeight = Math.max(
                    300,
                    Math.min(
                        window.innerHeight * 0.9,
                        resizeStartRef.current.height + deltaY,
                    ),
                );
            }

            // Handle resize from top edge
            if (direction.includes("n")) {
                const potentialHeight = resizeStartRef.current.height - deltaY;
                if (
                    potentialHeight >= 300 &&
                    potentialHeight <= window.innerHeight * 0.9
                ) {
                    newHeight = potentialHeight;
                    newY = resizeStartRef.current.y + deltaY;
                }
            }

            // Update size and position directly for smooth resize
            overlay.style.width = `${newWidth}px`;
            overlay.style.height = `${newHeight}px`;
            overlay.style.transform = `translate(${newX}px, ${newY}px)`;
        };

        const handleMouseUp = () => {
            if (!resizeStartRef.current || !overlay) return;

            // Get final dimensions from styles
            const finalWidth = parseFloat(overlay.style.width);
            const finalHeight = parseFloat(overlay.style.height);
            const finalX = parseFloat(
                overlay.style.transform.split("(")[1]?.split("px")[0] || "0",
            );
            const finalY = parseFloat(
                overlay.style.transform.split(",")[1]?.split("px")[0] || "0",
            );

            // Update state with final values
            setSize({ width: finalWidth, height: finalHeight });
            setPosition({ x: finalX, y: finalY });
            normalSizeRef.current = { width: finalWidth, height: finalHeight };
            normalPositionRef.current = { x: finalX, y: finalY };
            setIsResizing(false);
            resizeStartRef.current = null;
            resizeDirectionRef.current = "";
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        if (!isTransitioning) return;
        if (transitionTimeoutRef.current) {
            window.clearTimeout(transitionTimeoutRef.current);
        }
        transitionTimeoutRef.current = window.setTimeout(() => {
            setIsTransitioning(false);
            transitionTimeoutRef.current = null;
        }, 260);
        return () => {
            if (transitionTimeoutRef.current) {
                window.clearTimeout(transitionTimeoutRef.current);
                transitionTimeoutRef.current = null;
            }
        };
    }, [isTransitioning]);

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

    // Don't render during SSR to avoid hydration errors
    if (!mounted) {
        return null;
    }

    return (
        <>
            {/* Main Chat Overlay */}
            <AnimatePresence>
                {(!isMinimized || hasEverMinimized) && (
                    <Draggable
                        nodeRef={draggableNodeRef}
                        handle=".drag-handle"
                        position={position}
                        onDrag={(e, data) => {
                            if (isMinimized) return;
                            const nextPosition = { x: data.x, y: data.y };
                            setPosition(nextPosition);
                            normalPositionRef.current = nextPosition;
                        }}
                        onStart={() => setIsDragging(true)}
                        onStop={() => setIsDragging(false)}
                        bounds={
                            typeof window !== "undefined"
                                ? {
                                      left: 0,
                                      top: 0,
                                      right: Math.max(
                                          0,
                                          window.innerWidth - size.width,
                                      ),
                                      bottom: Math.max(
                                          0,
                                          window.innerHeight - size.height,
                                      ),
                                  }
                                : undefined
                        }
                        disabled={isResizing || isMinimized}
                    >
                        <div
                            ref={draggableNodeRef}
                            style={{
                                width: size.width,
                                height: size.height,
                                userSelect: isResizing ? "none" : "auto",
                                willChange: isResizing
                                    ? "transform, width, height"
                                    : "auto",
                                transition:
                                    isDragging || isResizing
                                        ? "none"
                                        : isTransitioning
                                          ? "transform 220ms ease, width 220ms ease, height 220ms ease"
                                          : "none",
                            }}
                            className={`fixed top-0 left-0 z-40 ${isResizing ? "select-none" : ""}`}
                            role="dialog"
                            aria-label="Chat History"
                        >
                            <motion.div
                                initial={
                                    hasEverMinimized
                                        ? {
                                              opacity: 0,
                                              scale: 0.05,
                                          }
                                        : {
                                              opacity: 0,
                                              scale: 0.95,
                                          }
                                }
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    scale: 0.05,
                                    opacity: 0,
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
                                style={{
                                    transformOrigin: "top center",
                                    width: "100%",
                                    height: "100%",
                                }}
                                className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
                            >
                                {/* Header with Minimize Button - Drag Handle */}
                                <div
                                    className={`drag-handle h-14 px-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 select-none ${
                                        isResizing || isMinimized
                                            ? "cursor-default"
                                            : "cursor-move"
                                    }`}
                                >
                                    {isMinimized ? (
                                        <button
                                            onClick={handleMaximize}
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                            aria-label="Show chat history"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleMinimize}
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                            aria-label="Minimize chat history"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                    )}
                                    <span className="text-sm font-medium text-white/70">
                                        Chat History
                                    </span>
                                    <div className="w-8" />{" "}
                                    {/* Spacer for symmetry */}
                                </div>

                                {!isMinimized && (
                                    <>
                                        {/* Messages Container */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                        scale: 0.98,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
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
                                                                {
                                                                    message.content
                                                                }
                                                            </div>
                                                            <span className="text-xs text-white/40 mt-1">
                                                                {formatTimestamp(
                                                                    message.timestamp,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        /* AI Message - Plain Text or Generating Status */
                                                        <div className="flex flex-col items-start max-w-[85%]">
                                                            <div className="text-white/90 text-sm leading-relaxed">
                                                                {message.isGenerating ? (
                                                                    <GenerationStatus />
                                                                ) : message.messageType ===
                                                                      "plan" &&
                                                                  message.sectionPlans ? (
                                                                    <div className="rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-black/40 shadow-[0_0_30px_rgba(249,115,22,0.25)] px-4 py-3">
                                                                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-orange-300/80">
                                                                            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
                                                                            Plan ready
                                                                        </div>
                                                                        {message.planSummary && (
                                                                            <div className="mt-2 text-sm text-white">
                                                                                {message.planSummary}
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-3 space-y-2">
                                                                            {message.sectionPlans.map(
                                                                                (plan) => (
                                                                                    <div
                                                                                        key={`${message.id}-${plan.sectionKey}`}
                                                                                        className="rounded-xl border border-orange-200/10 bg-black/30 px-3 py-2"
                                                                                    >
                                                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-orange-200/90">
                                                                                            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-200">
                                                                                                {plan.action}
                                                                                            </span>
                                                                                            <span className="text-white/70">
                                                                                                {plan.sectionKey}
                                                                                            </span>
                                                                                            {(plan.action ===
                                                                                                "modify" ||
                                                                                                plan.action ===
                                                                                                    "add") && (
                                                                                                <span className="rounded-full border border-orange-400/40 px-2 py-0.5 text-orange-100">
                                                                                                    {
                                                                                                        plan.intensity
                                                                                                    }
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="mt-2 text-sm text-white/90">
                                                                                            {
                                                                                                plan.instruction
                                                                                            }
                                                                                        </div>
                                                                                        {plan.rationale && (
                                                                                            <div className="mt-1 text-xs text-white/50">
                                                                                                {
                                                                                                    plan.rationale
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-3 text-xs text-orange-200/70">
                                                                            Approve to apply, or keep chatting to
                                                                            adjust.
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <StreamingText
                                                                        content={message.content}
                                                                        className="whitespace-pre-line"
                                                                        delayMs={30}
                                                                        skipAnimation={completedStreamingIds.has(
                                                                            message.id,
                                                                        )}
                                                                        onComplete={() =>
                                                                            handleStreamingComplete(
                                                                                message.id,
                                                                            )
                                                                        }
                                                                    />
                                                                )}
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

                                            {/* Scroll anchor */}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Resize Handles - Corners */}
                                        {/* Top-Left Corner */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "nw")
                                            }
                                            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10"
                                            style={{ touchAction: "none" }}
                                        />

                                        {/* Top-Right Corner */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "ne")
                                            }
                                            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-10"
                                            style={{ touchAction: "none" }}
                                        />

                                        {/* Bottom-Left Corner */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "sw")
                                            }
                                            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-10"
                                            style={{ touchAction: "none" }}
                                        />

                                        {/* Bottom-Right Corner */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "se")
                                            }
                                            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
                                            style={{ touchAction: "none" }}
                                        />

                                        {/* Resize Handles - Edges */}
                                        {/* Top Edge */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "n")
                                            }
                                            className="absolute top-0 left-4 right-4 h-2 cursor-n-resize hover:bg-white/5 transition-colors"
                                            style={{ touchAction: "none" }}
                                        />

                                        {/* Bottom Edge */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "s")
                                            }
                                            className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-white/5 transition-colors"
                                            style={{ touchAction: "none" }}
                                        />

                                        {/* Left Edge */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "w")
                                            }
                                            className="absolute top-4 bottom-4 left-0 w-2 cursor-w-resize hover:bg-white/5 transition-colors"
                                            style={{ touchAction: "none" }}
                                        />

                                        {/* Right Edge */}
                                        <div
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, "e")
                                            }
                                            className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize hover:bg-white/5 transition-colors"
                                            style={{ touchAction: "none" }}
                                        />
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </Draggable>
                )}
            </AnimatePresence>
        </>
    );
};
