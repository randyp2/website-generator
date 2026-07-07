"use client";

import { GenerationStatus } from "@/components/ui/GenerationStatus";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/preview";
import type { ColorPresetRecommendation } from "@/types/style";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, MessageSquareText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ColorPickerPanel } from "./ColorPickerPanel";
import { StyleChatComposer } from "./style-chat/StyleChatComposer";
import { StyleChatMessage } from "./style-chat/StyleChatMessage";
import { TypographyPickerPanel } from "./TypographyPickerPanel";

interface PortfolioStyleChatProps {
    messages: Message[];
    isInitializing?: boolean;
    isInputDisabled?: boolean;
    isSending?: boolean;
    onSendMessage: (prompt: string) => void;
    onContinue?: () => void;
    continueLabel?: string;
    isContinueDisabled?: boolean;
    showColorPicker?: boolean;
    onColorSubmit?: (colors: Record<string, string>) => void;
    recommendedColorPresets?: ColorPresetRecommendation[];
    showTypographyPicker?: boolean;
    onTypographySubmit?: (fonts: { heading: string; body: string }) => void;
    recommendedHeadingFont?: string;
    recommendedBodyFont?: string;
    onLayoutSubmit?: (layout: string) => void;
    className?: string;
}

const composerFrameClass = "w-full max-w-3xl";

export const PortfolioStyleChat = ({
    messages,
    isInitializing = false,
    isInputDisabled = false,
    isSending = false,
    onSendMessage,
    onContinue,
    continueLabel = "Continue to Revise/Edit",
    isContinueDisabled = false,
    showColorPicker = false,
    onColorSubmit,
    recommendedColorPresets = [],
    showTypographyPicker = false,
    onTypographySubmit,
    recommendedHeadingFont,
    recommendedBodyFont,
    onLayoutSubmit,
    className,
}: PortfolioStyleChatProps) => {
    const [prompt, setPrompt] = useState("");
    // Completion the user opted out of via "Continue Chatting to Revise".
    // Keyed by message id so a fresh completion re-triggers the CTA swap.
    const [dismissedCompletionId, setDismissedCompletionId] = useState<
        string | null
    >(null);
    const endRef = useRef<HTMLDivElement>(null);
    const hasUserStarted = messages.some((message) => message.role === "user");
    const lastMessage = messages[messages.length - 1];
    const completionMessageId =
        lastMessage?.role === "ai" && lastMessage.isStyleComplete
            ? lastMessage.id
            : null;
    const showCompletionCta =
        !!onContinue &&
        completionMessageId !== null &&
        completionMessageId !== dismissedCompletionId;
    const hasStarted =
        isInitializing ||
        hasUserStarted ||
        isSending ||
        showColorPicker ||
        showTypographyPicker;

    useEffect(() => {
        if (!hasStarted) return;
        // "nearest" only scrolls when the marker is out of view, so short
        // conversations never scroll past the composer.
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [hasStarted, messages, isSending]);

    const sendMessage = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed || isSending || isInputDisabled || isInitializing) return;
        onSendMessage(trimmed);
        setPrompt("");
    };

    const composer = (
        <StyleChatComposer
            prompt={prompt}
            onPromptChange={setPrompt}
            onSend={() => sendMessage(prompt)}
            isInputDisabled={isInputDisabled || isInitializing}
            isSendDisabled={
                isSending || isInputDisabled || isInitializing || !prompt.trim()
            }
            actionsPlacement={hasStarted ? "up" : "down"}
        />
    );

    const renderPickers = (itemClassName?: string) => (
        <>
            {showColorPicker && onColorSubmit && (
                <div className={itemClassName}>
                    <ColorPickerPanel
                        onSubmit={onColorSubmit}
                        recommendedPresets={recommendedColorPresets}
                    />
                </div>
            )}

            {showTypographyPicker && onTypographySubmit && (
                <div className={itemClassName}>
                    <TypographyPickerPanel
                        onSubmit={onTypographySubmit}
                        recommendedHeadingFont={recommendedHeadingFont}
                        recommendedBodyFont={recommendedBodyFont}
                    />
                </div>
            )}
        </>
    );

    return (
        <section
            className={cn(
                "relative mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-6xl flex-col",
                className,
            )}
        >
            {/* Pinned to the top right of the scrollport; -mb cancels its
                flow height so the landing hero stays vertically centered. */}
            {onContinue && !showCompletionCta && (
                <div className="pointer-events-none sticky top-2 z-30 -mb-10 flex justify-end px-4 md:px-8">
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={isContinueDisabled}
                        className="group pointer-events-auto inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm ring-1 ring-black/5 transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span>{continueLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </button>
                </div>
            )}

            <AnimatePresence initial={false} mode="popLayout">
                {!hasStarted ? (
                    <div
                        key="style-landing"
                        className="flex flex-1 items-center px-6 py-8 md:px-10"
                    >
                        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center">
                            <div className="mb-10 w-full max-w-4xl text-center md:mb-12">
                                <h1 className="text-4xl font-light tracking-normal text-foreground/90 md:text-5xl dark:text-white/88">
                                    What are we building?
                                </h1>
                            </div>

                            <div
                                className={cn(
                                    "style-chat-composer-stage relative",
                                    composerFrameClass,
                                )}
                            >
                                <div
                                    className="style-chat-composer-burst"
                                    aria-hidden="true"
                                />
                                <div className="relative z-10">{composer}</div>
                            </div>

                            {renderPickers("mt-8")}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        key="style-chat-active"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="flex flex-1 flex-col"
                    >
                        {isInitializing ? (
                            <Loader2 className="m-auto h-6 w-6 animate-spin text-muted-foreground dark:text-white/40" />
                        ) : (
                            <div className="flex-1 px-4 pb-6 pt-6 md:px-10 md:pt-10">
                                <div className="mx-auto flex w-full max-w-4xl flex-col space-y-5">
                                    {messages.map((message) => (
                                        <StyleChatMessage
                                            key={message.id}
                                            message={message}
                                            onSuggestionClick={sendMessage}
                                            onLayoutSelect={onLayoutSubmit}
                                        />
                                    ))}

                                    {renderPickers()}

                                    {isSending && (
                                        <GenerationStatus statusText="Thinking..." />
                                    )}
                                    <div
                                        ref={endRef}
                                        className="scroll-mb-28"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Sticky within the dashboard scroller: stays pinned
                            to the viewport bottom while messages scroll past
                            in the single outer scrollbar. */}
                        <div className="pointer-events-none sticky bottom-0 z-20 px-4 pb-4 md:px-8 md:pb-6">
                            <div
                                className={cn(
                                    "mx-auto flex flex-col gap-3",
                                    composerFrameClass,
                                )}
                            >
                                <AnimatePresence
                                    initial={false}
                                    mode="popLayout"
                                >
                                    {showCompletionCta ? (
                                        <motion.div
                                            key="style-completion-cta"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.18,
                                                ease: "easeOut",
                                            }}
                                            className="pointer-events-auto flex flex-col items-center justify-center gap-3 sm:flex-row"
                                        >
                                            <motion.button
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.92,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.92,
                                                }}
                                                transition={{
                                                    duration: 0.28,
                                                    delay: 0.3,
                                                    ease: "easeOut",
                                                }}
                                                type="button"
                                                onClick={onContinue}
                                                disabled={isContinueDisabled}
                                                className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_24px_80px_rgba(0,0,0,0.16)] ring-1 ring-black/5 transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span>
                                                    Continue to Upload Resume
                                                </span>
                                                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                                            </motion.button>

                                            <motion.button
                                                layoutId="style-chat-composer"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 120,
                                                    damping: 22,
                                                }}
                                                type="button"
                                                onClick={() =>
                                                    setDismissedCompletionId(
                                                        completionMessageId,
                                                    )
                                                }
                                                className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-border bg-card/95 px-6 text-sm font-medium text-foreground shadow-sm backdrop-blur-2xl transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-white/10 dark:bg-[#1c1d22]/92 dark:text-white dark:hover:bg-white/5"
                                            >
                                                <MessageSquareText className="h-4 w-4" />
                                                <span>
                                                    Continue Chatting to Revise
                                                </span>
                                            </motion.button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="style-chat-composer-bar"
                                            layoutId="style-chat-composer"
                                            transition={{
                                                type: "spring",
                                                stiffness: 220,
                                                damping: 26,
                                            }}
                                            className="pointer-events-auto"
                                        >
                                            {composer}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
