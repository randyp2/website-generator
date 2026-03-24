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
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "group relative overflow-hidden rounded-2xl border-2 text-left transition-all",
                isSelected
                    ? "border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.3)]"
                    : isRecommended
                      ? "border-amber-300/40 shadow-[0_0_0_1px_rgba(252,211,77,0.18)] hover:border-amber-300/55"
                      : "border-white/10 hover:border-white/25",
            )}
        >
            <div
                className="space-y-3 p-4"
                style={{ backgroundColor: paletteColors.background }}
            >
                {isRecommended ? (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-300/35 bg-amber-300/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-100">
                        <Sparkles className="h-3 w-3" />
                        {recommendationRank ? `AI Pick #${recommendationRank}` : "AI Pick"}
                    </div>
                ) : null}
                {isSelected ? (
                    <div className="absolute right-3 top-3">
                        <Check
                            className="h-4 w-4"
                            style={{ color: paletteColors.primary }}
                        />
                    </div>
                ) : null}
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
                        style={{ color: paletteColors.text }}
                    >
                        {name}
                    </h3>
                    <p
                        className="text-xs"
                        style={{ color: paletteColors.muted }}
                    >
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
};
