"use client";

import type { StylePreferences } from "@/types/style";
import { Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

export const StyleSummaryCard = ({
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
