"use client";

import type { Message } from "@/types/preview";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LayoutPreviewGrid } from "../layout-preview/LayoutPreviewGrid";

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

export const AiMessageContent = ({
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
