"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaletteWindowMock } from "./PaletteWindowMock";
import type { ColorPickerSurfaceMode, PaletteColors } from "./types";

interface PaletteThemeCardProps {
    name: string;
    description: string;
    paletteColors: PaletteColors;
    isSelected: boolean;
    surfaceMode: ColorPickerSurfaceMode;
    isRecommended?: boolean;
    recommendationRank?: number;
    onSelect: () => void;
}

/**
 * Theme-toggle style palette tile: the tile background doubles as the mock
 * window's titlebar strip, the window wireframe is clipped at the bottom
 * edge, and the palette name sits in a pill overlapping the window.
 *
 * Selection is a blue border + ring plus an animated underline shared via
 * framer-motion layoutId; wrap sibling cards in a LayoutGroup when multiple
 * panels can be mounted at once.
 */
export const PaletteThemeCard = ({
    name,
    description,
    paletteColors,
    isSelected,
    surfaceMode,
    isRecommended = false,
    recommendationRank,
    onSelect,
}: PaletteThemeCardProps) => (
    <button
        type="button"
        onClick={onSelect}
        title={description}
        aria-pressed={isSelected}
        className={cn(
            "relative flex w-60 shrink-0 cursor-pointer snap-start items-end justify-center rounded-md border px-1.5 pt-3 transition",
            surfaceMode === "dark"
                ? "border-white/15 bg-neutral-800 hover:border-white/30"
                : "border-neutral-300 bg-gray-200 hover:border-neutral-400",
            isSelected && "border-primary ring-2 ring-primary/50",
        )}
    >
        {isRecommended && (
            <span className="absolute left-1/2 top-1.5 z-20 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-primary/50 bg-primary/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm">
                <Sparkles className="h-2.5 w-2.5" />
                {recommendationRank
                    ? `AI Pick #${recommendationRank}`
                    : "AI Pick"}
            </span>
        )}

        <span className="pointer-events-none block h-full w-full overflow-hidden">
            <PaletteWindowMock colors={paletteColors} className="h-44" />
        </span>

        {/* Name pill straddling the tile's bottom edge, over the mock window */}
        <span className="absolute inset-x-0 -bottom-3 flex justify-center">
            <span className="relative">
                <span
                    className={cn(
                        "inline-flex h-[28px] items-center justify-center rounded-md px-3 text-[13px] font-semibold leading-none shadow-md",
                        surfaceMode === "dark"
                            ? "border border-white/10 bg-neutral-800 text-white"
                            : "border border-neutral-200 bg-white text-neutral-900",
                    )}
                >
                    {name}
                </span>
                {isSelected && (
                    <motion.span
                        layoutId="active-palette-underline"
                        className="absolute inset-x-1.5 -bottom-1.5 h-0.5 rounded-full bg-primary"
                    />
                )}
            </span>
        </span>
    </button>
);
