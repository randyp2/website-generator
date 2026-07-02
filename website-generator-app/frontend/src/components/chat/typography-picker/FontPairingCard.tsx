"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FontPairing {
    name: string;
    heading: string;
    body: string;
}

interface FontPairingCardProps {
    pairing: FontPairing;
    isSelected: boolean;
    isRecommended?: boolean;
    onSelect: () => void;
}

/**
 * Pairing tile matching PaletteThemeCard: a mock document previews the
 * heading and body fonts, the pairing name sits in a pill straddling the
 * tile's bottom edge, and selection shows the primary ring plus the shared
 * layoutId underline (wrap sibling cards in a LayoutGroup).
 *
 * Selecting a card assigns both fonts at once.
 */
export const FontPairingCard = ({
    pairing,
    isSelected,
    isRecommended = false,
    onSelect,
}: FontPairingCardProps) => (
    <button
        type="button"
        onClick={onSelect}
        title={`${pairing.heading} + ${pairing.body}`}
        aria-pressed={isSelected}
        className={cn(
            "relative flex w-60 shrink-0 cursor-pointer snap-start items-end justify-center rounded-md border bg-gray-200 px-1.5 pt-3 transition dark:bg-neutral-800",
            "border-neutral-300 hover:border-neutral-400 dark:border-white/15 dark:hover:border-white/30",
            isSelected && "border-primary ring-2 ring-primary/50",
        )}
    >
        {isRecommended && (
            <span className="absolute left-1/2 top-1.5 z-20 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-primary/50 bg-primary/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm">
                <Sparkles className="h-2.5 w-2.5" />
                AI Pick
            </span>
        )}

        {/* Mock document, clipped at the tile's bottom edge */}
        <span className="pointer-events-none block h-44 w-full overflow-hidden rounded-t-lg border border-b-0 border-black/25 bg-white p-4 text-left shadow-xl shadow-black/20 dark:bg-neutral-900">
            <span
                className="block text-xl leading-snug text-neutral-900 dark:text-white"
                style={{ fontFamily: `'${pairing.heading}', sans-serif` }}
            >
                Build Better Work
            </span>
            <span
                className="mt-2 block text-xs leading-relaxed text-neutral-600 dark:text-white/65"
                style={{ fontFamily: `'${pairing.body}', sans-serif` }}
            >
                Typography sets the pace and clarity of your portfolio, from
                the hero statement down to the footnotes.
            </span>
            <span className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-white/40">
                {pairing.heading} + {pairing.body}
            </span>
        </span>

        {/* Name pill straddling the tile's bottom edge */}
        <span className="absolute inset-x-0 -bottom-3 flex justify-center">
            <span className="relative">
                <span className="inline-flex h-[28px] items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-[13px] font-semibold leading-none text-neutral-900 shadow-md dark:border-white/10 dark:bg-neutral-800 dark:text-white">
                    {pairing.name}
                </span>
                {isSelected && (
                    <motion.span
                        layoutId="active-pairing-underline"
                        className="absolute inset-x-1.5 -bottom-1.5 h-0.5 rounded-full bg-primary"
                    />
                )}
            </span>
        </span>
    </button>
);
