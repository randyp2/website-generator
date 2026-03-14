"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaletteColors, ThemedPalette } from "./types";

interface PresetPaletteCardProps {
    palette: ThemedPalette;
    paletteColors: PaletteColors;
    isSelected: boolean;
    onSelect: () => void;
}

export const PresetPaletteCard = ({
    palette,
    paletteColors,
    isSelected,
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
                    : "border-white/10 hover:border-white/25",
            )}
        >
            <div
                className="space-y-3 p-4"
                style={{ backgroundColor: paletteColors.background }}
            >
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
                            className="h-6 w-6 rounded-md first:rounded-l-lg last:rounded-r-lg"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <div>
                    <h3
                        className="font-medium"
                        style={{ color: paletteColors.text }}
                    >
                        {palette.name}
                    </h3>
                    <p
                        className="text-xs"
                        style={{ color: paletteColors.muted }}
                    >
                        {palette.description}
                    </p>
                </div>
            </div>
        </button>
    );
};
