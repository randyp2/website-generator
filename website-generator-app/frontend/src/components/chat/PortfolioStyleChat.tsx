"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { Message } from "@/types/preview";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Check,
    MessageSquareText,
    Plus,
    Send,
    Sparkles,
} from "lucide-react";
import type { StylePreferences } from "@/types/style";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { ColorPickerPanel } from "./ColorPickerPanel";
import { TypographyPickerPanel } from "./TypographyPickerPanel";
import { LayoutPreviewGrid } from "./layout-preview/LayoutPreviewGrid";

interface PortfolioStyleChatProps {
    messages: Message[];
    isSending?: boolean;
    onSendMessage: (prompt: string) => void;
    onContinue?: () => void;
    continueLabel?: string;
    isContinueDisabled?: boolean;
    showColorPicker?: boolean;
    onColorSubmit?: (colors: Record<string, string>) => void;
    showTypographyPicker?: boolean;
    onTypographySubmit?: (fonts: { heading: string; body: string }) => void;
    recommendedHeadingFont?: string;
    recommendedBodyFont?: string;
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
        className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/[0.12] hover:text-white"
    >
        {label}
    </button>
);

interface AiMessageContentProps {
    message: Message;
    onSuggestionClick?: (suggestion: string) => void;
}

const AiMessageContent = ({ message, onSuggestionClick }: AiMessageContentProps) => (
    <div className="space-y-3">
        <ReactMarkdown
            components={{
                p: ({ children }) => <p className="my-1">{children}</p>,
                strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                ),
                ul: ({ children }) => (
                    <ul className="my-1.5 list-disc space-y-0.5 pl-4">{children}</ul>
                ),
                li: ({ children }) => (
                    <li className="text-white/80">{children}</li>
                ),
            }}
        >
            {message.content}
        </ReactMarkdown>

        {message.designTip && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-200/90">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span>{message.designTip}</span>
            </div>
        )}

        {message.suggestions && message.suggestions.length > 0 && (
            message.previewType === "layout_style" ? (
                <LayoutPreviewGrid
                    suggestions={message.suggestions}
                    onSelect={(layoutName) => onSuggestionClick?.(layoutName)}
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
            )
        )}
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

const StyleSummaryCard = ({ content, stylePreferences }: StyleSummaryCardProps) => {
    const entries = stylePreferences
        ? Object.entries(stylePreferences).filter(
              ([key, value]) =>
                  value && key in STYLE_PREF_LABELS && typeof value === "string" && value.trim(),
          )
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Style profile complete</span>
            </div>

            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="my-1">{children}</p>,
                    strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>

            {entries.length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    {entries.map(([key, value]) => (
                        <div key={key} className="min-w-0">
                            <span className="text-xs text-white/40">
                                {STYLE_PREF_LABELS[key]}
                            </span>
                            <p className="truncate text-sm text-white/80">{value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const composerFrameClass = "w-full max-w-[980px]";

export function PortfolioStyleChat({
    messages,
    isSending = false,
    onSendMessage,
    onContinue,
    continueLabel = "Continue to Revise/Edit",
    isContinueDisabled = false,
    showColorPicker = false,
    onColorSubmit,
    showTypographyPicker = false,
    onTypographySubmit,
    recommendedHeadingFont,
    recommendedBodyFont,
    className,
}: PortfolioStyleChatProps) {
    const [prompt, setPrompt] = useState("");
    const [firstName, setFirstName] = useState("there");
    const [composerDockStyle, setComposerDockStyle] = useState<{
        left: number;
        width: number;
    } | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasUserStarted = messages.some((message) => message.role === "user");
    const hasStarted =
        hasUserStarted || isSending || showColorPicker || showTypographyPicker;

    useEffect(() => {
        if (!hasStarted) return;
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [hasStarted, messages, isSending]);

    useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }, [prompt]);

    useEffect(() => {
        let isMounted = true;

        const loadUser = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!isMounted || !user) return;

            const rawName =
                user.user_metadata?.full_name ??
                user.user_metadata?.name ??
                (user.email ? user.email.split("@")[0] : null);

            if (!rawName) return;

            const normalizedFirstName = String(rawName).trim().split(/\s+/)[0];
            if (normalizedFirstName) {
                setFirstName(normalizedFirstName.toLowerCase());
            }
        };

        void loadUser();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const updateComposerDockStyle = () => {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            setComposerDockStyle({
                left: rect.left,
                width: rect.width,
            });
        };

        updateComposerDockStyle();

        const section = sectionRef.current;
        if (!section) return;

        const resizeObserver = new ResizeObserver(() => {
            updateComposerDockStyle();
        });

        resizeObserver.observe(section);
        window.addEventListener("resize", updateComposerDockStyle);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateComposerDockStyle);
        };
    }, []);

    const handleSend = () => {
        const value = prompt.trim();
        if (!value || isSending) return;
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
        <div
            className={cn(
                "overflow-hidden rounded-[2rem] border border-white/10 bg-[#1c1d22]/92 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl",
                "px-6 py-2.5 md:px-7 md:py-3",
            )}
        >
            <div className="flex items-start gap-3">
                <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe the general idea for your portfolio..."
                    className={cn(
                        "resize-none border-0 bg-transparent px-0 text-white placeholder:text-white/55 shadow-none focus-visible:ring-0",
                        "min-h-[32px] max-h-20 py-1.5 text-base leading-6 md:text-lg",
                    )}
                />
                <Button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || !prompt.trim()}
                    className={cn(
                        "-mt-0.5 shrink-0 rounded-2xl bg-transparent text-white transition hover:bg-white/5 disabled:bg-transparent disabled:text-white/30",
                        "h-12 w-12",
                    )}
                    aria-label="Send message"
                >
                    <Send strokeWidth={2.4} className="h-7 w-7" />
                </Button>
            </div>

            <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-white/70">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="text-xs">Add references</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
                        <MessageSquareText className="h-3.5 w-3.5" />
                        <span className="text-xs">General idea</span>
                    </div>
                </div>
                {onContinue && (
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={isContinueDisabled}
                        className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-[#0b1733] via-[#123a82] to-[#1a56c7] px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-900/30 transition hover:shadow-blue-700/35 disabled:opacity-50"
                    >
                        <span>{continueLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <section
            ref={sectionRef}
            className={cn(
                "relative mx-auto flex h-[calc(100vh-10rem)] w-full max-w-6xl flex-col",
                className,
            )}
        >
            <AnimatePresence initial={false} mode="popLayout">
                {!hasStarted ? (
                    <motion.div
                        key="style-landing"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="flex flex-1 items-center px-6 py-8 md:px-10"
                    >
                        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center">
                            <div className="mb-5 w-full max-w-4xl text-left">
                                <div className="mb-4 flex items-center gap-3 text-white/90">
                                    <Sparkles className="h-9 w-9 text-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.12)] md:h-11 md:w-11" />
                                    <span className="text-4xl font-medium tracking-tight md:text-6xl">
                                        Hey {firstName},
                                    </span>
                                </div>
                                <p className="max-w-2xl text-base leading-7 text-white/68 md:text-lg">
                                    Let&apos;s make your portfolio impossible to ignore.
                                </p>
                            </div>

                            <motion.div
                                layoutId="style-chat-composer"
                                transition={{
                                    type: "spring",
                                    stiffness: 220,
                                    damping: 26,
                                }}
                                className={composerFrameClass}
                            >
                                {renderComposer()}
                            </motion.div>

                            {showColorPicker && onColorSubmit && (
                                <div className="mt-8">
                                    <ColorPickerPanel
                                        onSubmit={onColorSubmit}
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
                    </motion.div>
                ) : (
                    <motion.div
                        key="style-chat-active"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="relative flex min-h-0 flex-1 flex-col"
                    >
                        <div className="flex-1 overflow-y-auto px-4 pb-36 pt-6 md:px-10 md:pb-40 md:pt-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
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
                                                    ? "max-w-[88%] rounded-2xl bg-linear-to-r from-blue-600 to-blue-500 px-4 text-white md:max-w-[80%]"
                                                    : "text-white/90",
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
                                                    />
                                                ) : (
                                                    <AiMessageContent
                                                        message={message}
                                                        onSuggestionClick={(suggestion) => {
                                                            setPrompt(suggestion);
                                                        }}
                                                    />
                                                )
                                            ) : (
                                                message.content
                                            )}
                                        </div>
                                        <span className="mt-1 text-xs text-white/40">
                                            {formatTimestamp(message.timestamp)}
                                        </span>
                                    </div>
                                ))}

                                {showColorPicker && onColorSubmit && (
                                    <ColorPickerPanel
                                        onSubmit={onColorSubmit}
                                    />
                                )}

                                {showTypographyPicker && onTypographySubmit && (
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
                                    <div className="text-xs text-white/50">
                                        Generating response...
                                    </div>
                                )}
                                <div ref={endRef} />
                            </div>
                        </div>

                        <div
                            className="pointer-events-none fixed bottom-6 z-20 px-4 md:bottom-8 md:px-8"
                            style={composerDockStyle ?? undefined}
                        >
                            <div className={cn("mx-auto flex flex-col gap-3", composerFrameClass)}>
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
