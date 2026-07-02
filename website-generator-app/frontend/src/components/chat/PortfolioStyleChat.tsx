"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/preview";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Check,
    Loader2,
    MessageSquareText,
    Plus,
    Send,
    Sparkles,
} from "lucide-react";
import type {
    ColorPresetRecommendation,
    StylePreferences,
} from "@/types/style";
import { Button } from "@/components/ui/button";
import { GenerationStatus } from "@/components/ui/GenerationStatus";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { ColorPickerPanel } from "./ColorPickerPanel";
import { TypographyPickerPanel } from "./TypographyPickerPanel";
import { LayoutPreviewGrid } from "./layout-preview/LayoutPreviewGrid";

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

interface SuggestionChipProps {
    label: string;
    onClick: () => void;
}

const SuggestionChip = ({ label, onClick }: SuggestionChipProps) => (
    <button
        type="button"
        onClick={onClick}
        className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground dark:border-white/15 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.12] dark:hover:text-white"
    >
        {label}
    </button>
);

interface AiMessageContentProps {
    message: Message;
    onSuggestionClick?: (suggestion: string) => void;
    onLayoutSelect?: (layout: string) => void;
}

const AiMessageContent = ({
    message,
    onSuggestionClick,
    onLayoutSelect,
}: AiMessageContentProps) => (
    <div className="space-y-3">
        <ReactMarkdown
            components={{
                p: ({ children }) => <p className="my-1">{children}</p>,
                strong: ({ children }) => (
                    <strong className="font-semibold text-foreground dark:text-white">
                        {children}
                    </strong>
                ),
                ul: ({ children }) => (
                    <ul className="my-1.5 list-disc space-y-0.5 pl-4">
                        {children}
                    </ul>
                ),
                li: ({ children }) => (
                    <li className="text-muted-foreground dark:text-white/80">
                        {children}
                    </li>
                ),
            }}
        >
            {message.content}
        </ReactMarkdown>

        {message.designTip && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-700 dark:text-blue-200/90">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>{message.designTip}</span>
            </div>
        )}

        {message.suggestions &&
            message.suggestions.length > 0 &&
            (message.previewType === "layout_style" ? (
                <LayoutPreviewGrid
                    suggestions={message.suggestions}
                    onSelect={(layoutName) =>
                        (onLayoutSelect ?? onSuggestionClick)?.(layoutName)
                    }
                />
            ) : (
                <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion) => (
                        <SuggestionChip
                            key={suggestion}
                            label={suggestion}
                            onClick={() => onSuggestionClick?.(suggestion)}
                        />
                    ))}
                </div>
            ))}
    </div>
);

const STYLE_PREF_LABELS: Record<string, string> = {
    layoutDensity: "Layout",
    tone: "Tone",
    visualStyle: "Visual Style",
    typography: "Typography",
    animationStyle: "Animations",
    whitespace: "Whitespace",
    imageryStyle: "Imagery",
    interactiveElements: "Interactions",
    sectionEmphasis: "Emphasis",
};

interface StyleSummaryCardProps {
    content: string;
    stylePreferences?: Partial<StylePreferences>;
}

const StyleSummaryCard = ({
    content,
    stylePreferences,
}: StyleSummaryCardProps) => {
    const entries = stylePreferences
        ? Object.entries(stylePreferences).filter(
              ([key, value]) =>
                  value &&
                  key in STYLE_PREF_LABELS &&
                  typeof value === "string" &&
                  value.trim(),
          )
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                    Style profile complete
                </span>
            </div>

            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="my-1">{children}</p>,
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground dark:text-white">
                            {children}
                        </strong>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>

            {entries.length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                    {entries.map(([key, value]) => (
                        <div key={key} className="min-w-0">
                            <span className="text-xs text-muted-foreground dark:text-white/40">
                                {STYLE_PREF_LABELS[key]}
                            </span>
                            <p className="truncate text-sm text-foreground/80 dark:text-white/80">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const composerFrameClass = "w-full max-w-3xl";

const composerActions = [
    { icon: Plus, label: "Add references" },
    { icon: MessageSquareText, label: "General idea" },
] as const;

export function PortfolioStyleChat({
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
}: PortfolioStyleChatProps) {
    const [prompt, setPrompt] = useState("");
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const composerRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasUserStarted = messages.some((message) => message.role === "user");
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

    useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }, [prompt]);

    // Close the composer actions menu when clicking outside the composer.
    useEffect(() => {
        if (!isActionsOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!composerRef.current?.contains(event.target as Node)) {
                setIsActionsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () =>
            document.removeEventListener("pointerdown", handlePointerDown);
    }, [isActionsOpen]);

    const handleSend = () => {
        const value = prompt.trim();
        if (!value || isSending || isInputDisabled || isInitializing) return;
        onSendMessage(value);
        setPrompt("");
    };

    const handleSuggestionSend = (suggestion: string) => {
        const value = suggestion.trim();
        if (!value || isSending || isInputDisabled || isInitializing) return;
        onSendMessage(value);
        setPrompt("");
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const renderComposer = () => (
        <div ref={composerRef} className="relative">
            <AnimatePresence>
                {isActionsOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute left-2 top-full z-30 mt-1.5 w-52 rounded-2xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#1c1d22]/95 dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                    >
                        {composerActions.map(({ icon: Icon, label }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setIsActionsOpen(false)}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground dark:text-white/80 dark:hover:bg-white/[0.08] dark:hover:text-white"
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-2 py-2 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl md:px-2.5 md:py-2.5 dark:border-white/10 dark:bg-[#1c1d22]/92 dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <button
                    type="button"
                    onClick={() => setIsActionsOpen((open) => !open)}
                    aria-label={
                        isActionsOpen ? "Close options" : "More options"
                    }
                    aria-expanded={isActionsOpen}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground dark:text-white/70 dark:hover:text-white"
                >
                    <Plus
                        className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isActionsOpen && "rotate-45",
                        )}
                    />
                </button>

                <Textarea
                    ref={textareaRef}
                    rows={1}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isInputDisabled || isInitializing}
                    placeholder="Describe the general idea for your portfolio..."
                    className={cn(
                        "resize-none border-0 bg-transparent px-2 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 dark:text-white dark:placeholder:text-white/55",
                        "max-h-20 min-h-10 py-2 text-base leading-6 md:text-lg",
                    )}
                />

                <Button
                    type="button"
                    onClick={handleSend}
                    disabled={
                        isSending ||
                        isInputDisabled ||
                        isInitializing ||
                        !prompt.trim()
                    }
                    className="h-12 w-12 shrink-0 rounded-full bg-transparent text-foreground transition hover:bg-muted disabled:bg-transparent disabled:text-muted-foreground/40 dark:text-white dark:hover:bg-white/5 dark:disabled:text-white/30"
                    aria-label="Send message"
                >
                    <Send strokeWidth={2.2} className="h-10 w-10" />
                </Button>
            </div>
        </div>
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
            {onContinue && (
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
                                <div className="relative z-10">
                                    {renderComposer()}
                                </div>
                            </div>

                            {showColorPicker && onColorSubmit && (
                                <div className="mt-8">
                                    <ColorPickerPanel
                                        onSubmit={onColorSubmit}
                                        recommendedPresets={
                                            recommendedColorPresets
                                        }
                                    />
                                </div>
                            )}

                            {showTypographyPicker && onTypographySubmit && (
                                <div className="mt-8">
                                    <TypographyPickerPanel
                                        onSubmit={onTypographySubmit}
                                        recommendedHeadingFont={
                                            recommendedHeadingFont
                                        }
                                        recommendedBodyFont={
                                            recommendedBodyFont
                                        }
                                    />
                                </div>
                            )}
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
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex flex-col",
                                                message.role === "user"
                                                    ? "items-end"
                                                    : "items-start",
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "py-3 text-[15px] leading-relaxed",
                                                    message.role === "user"
                                                        ? "max-w-[88%] rounded-full bg-muted px-6 py-3.5 text-foreground ring-1 ring-border md:max-w-[80%] dark:bg-zinc-800 dark:text-zinc-100 dark:ring-white/10"
                                                        : "text-foreground/90 dark:text-white/90",
                                                    message.role === "ai" &&
                                                        message.previewType
                                                        ? "max-w-full"
                                                        : message.role === "ai"
                                                          ? "max-w-[88%] md:max-w-[80%]"
                                                          : "",
                                                )}
                                            >
                                                {message.role === "ai" ? (
                                                    message.isStyleComplete ? (
                                                        <StyleSummaryCard
                                                            content={
                                                                message.content
                                                            }
                                                            stylePreferences={
                                                                message.stylePreferences
                                                            }
                                                        />
                                                    ) : (
                                                        <AiMessageContent
                                                            message={message}
                                                            onSuggestionClick={
                                                                handleSuggestionSend
                                                            }
                                                            onLayoutSelect={
                                                                onLayoutSubmit
                                                            }
                                                        />
                                                    )
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                            <span className="mt-1 text-xs text-muted-foreground dark:text-white/40">
                                                {formatTimestamp(
                                                    message.timestamp,
                                                )}
                                            </span>
                                        </div>
                                    ))}

                                    {showColorPicker && onColorSubmit && (
                                        <ColorPickerPanel
                                            onSubmit={onColorSubmit}
                                            recommendedPresets={
                                                recommendedColorPresets
                                            }
                                        />
                                    )}

                                    {showTypographyPicker &&
                                        onTypographySubmit && (
                                            <TypographyPickerPanel
                                                onSubmit={onTypographySubmit}
                                                recommendedHeadingFont={
                                                    recommendedHeadingFont
                                                }
                                                recommendedBodyFont={
                                                    recommendedBodyFont
                                                }
                                            />
                                        )}

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
                                <motion.div
                                    layoutId="style-chat-composer"
                                    transition={{
                                        type: "spring",
                                        stiffness: 220,
                                        damping: 26,
                                    }}
                                    className="pointer-events-auto"
                                >
                                    {renderComposer()}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
