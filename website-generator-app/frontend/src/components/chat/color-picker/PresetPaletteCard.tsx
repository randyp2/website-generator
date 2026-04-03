"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaletteColors } from "./types";

interface PresetPaletteCardProps {
    name: string;
    description: string;
    paletteColors: PaletteColors;
    isSelected: boolean;
    isRecommended?: boolean;
    recommendationRank?: number;
    onSelect: () => void;
}

export const PresetPaletteCard = ({
    name,
    description,
    paletteColors,
    isSelected,
    isRecommended = false,
    recommendationRank,
    onSelect,
}: PresetPaletteCardProps) => {
    const recommendedCardStyle = isRecommended
        ? {
              backgroundImage:
                  "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, var(--card) 82%), color-mix(in srgb, var(--accent) 28%, var(--card) 72%))",
              borderColor:
                  "color-mix(in srgb, var(--primary) 44%, var(--border) 56%)",
              boxShadow:
                  "0 0 0 1px color-mix(in srgb, var(--primary) 18%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)",
          }
        : undefined;

    const contentStyle = isRecommended
        ? {
              backgroundColor:
                  "color-mix(in srgb, var(--card) 82%, transparent)",
          }
        : { backgroundColor: paletteColors.background };

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "group relative overflow-hidden rounded-2xl border-2 text-left transition-all",
                isSelected
                    ? "border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.3)]"
                    : isRecommended
                      ? "hover:brightness-110"
                      : "border-white/10 hover:border-white/25",
            )}
            style={recommendedCardStyle}
        >
            <div className="space-y-3 p-4" style={contentStyle}>
                {(isRecommended || isSelected) && (
                    <div className="flex items-start justify-between gap-3">
                        {isRecommended ? (
                            <div
                                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-foreground)]"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--primary) 20%, transparent)",
                                    borderColor:
                                        "color-mix(in srgb, var(--primary) 40%, var(--border) 60%)",
                                }}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                {recommendationRank
                                    ? `AI Pick #${recommendationRank}`
                                    : "AI Pick"}
                            </div>
                        ) : (
                            <div />
                        )}
                        {isSelected ? (
                            <div>
                                <Check
                                    className="h-4 w-4"
                                    style={{
                                        color: isRecommended
                                            ? "var(--primary)"
                                            : paletteColors.primary,
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>
                )}
                <div className="flex gap-1.5">
                    {Object.entries(paletteColors).map(([key, color]) => (
                        <div
                            key={key}
                            className="h-6 w-6 rounded-md border border-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] first:rounded-l-lg last:rounded-r-lg"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <div>
                    <h3
                        className="font-medium"
                        style={{
                            color: isRecommended
                                ? "var(--foreground)"
                                : paletteColors.text,
                        }}
                    >
                        {name}
                    </h3>
                    <p
                        className="text-xs"
                        style={{
                            color: isRecommended
                                ? "var(--muted-foreground)"
                                : paletteColors.muted,
                        }}
                    >
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
};
