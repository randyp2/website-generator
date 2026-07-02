"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Plus, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const composerActions = [
    { icon: Plus, label: "Add references" },
    { icon: MessageSquareText, label: "General idea" },
] as const;

interface StyleChatComposerProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    onSend: () => void;
    isInputDisabled: boolean;
    isSendDisabled: boolean;
}

/**
 * Controlled chat input with an expandable actions menu. The prompt state
 * lives in the parent so it survives the landing/active layout switch.
 */
export const StyleChatComposer = ({
    prompt,
    onPromptChange,
    onSend,
    isInputDisabled,
    isSendDisabled,
}: StyleChatComposerProps) => {
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const composerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    return (
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
                    onChange={(event) => onPromptChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isInputDisabled}
                    placeholder="Describe the general idea for your portfolio..."
                    className={cn(
                        "resize-none border-0 bg-transparent px-2 text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 dark:text-white dark:placeholder:text-white/55",
                        "max-h-20 min-h-10 py-2 text-base leading-6 md:text-lg",
                    )}
                />

                <Button
                    type="button"
                    onClick={onSend}
                    disabled={isSendDisabled}
                    className="h-12 w-12 shrink-0 rounded-full bg-transparent text-foreground transition hover:bg-muted disabled:bg-transparent disabled:text-muted-foreground/40 dark:text-white dark:hover:bg-white/5 dark:disabled:text-white/30"
                    aria-label="Send message"
                >
                    <Send strokeWidth={2.2} className="h-10 w-10" />
                </Button>
            </div>
        </div>
    );
};
