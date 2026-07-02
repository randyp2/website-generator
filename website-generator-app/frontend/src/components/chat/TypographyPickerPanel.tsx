"use client";

import { LayoutGroup } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaletteCarousel } from "./color-picker/PaletteCarousel";
import {
    PICKER_BODY_CLASSES,
    PICKER_CONFIRM_CLASSES,
    PICKER_HEADING_CLASSES,
    PICKER_PANEL_CLASSES,
    TOGGLE_SHELL_CLASSES,
    toggleButtonClasses,
} from "./picker-styles";
import {
    FontPairingCard,
    type FontPairing,
} from "./typography-picker/FontPairingCard";

interface TypographyPickerPanelProps {
    onSubmit: (fonts: { heading: string; body: string }) => void;
    recommendedHeadingFont?: string;
    recommendedBodyFont?: string;
}

type FontCategory = "Sans-serif" | "Serif" | "Monospace" | "Display";
type PickerTab = "presets" | "custom";

interface FontEntry {
    name: string;
    category: FontCategory;
    googleName: string;
}

const APPROVED_FONTS: FontEntry[] = [
    { name: "Inter", category: "Sans-serif", googleName: "Inter" },
    { name: "Outfit", category: "Sans-serif", googleName: "Outfit" },
    {
        name: "Space Grotesk",
        category: "Sans-serif",
        googleName: "Space+Grotesk",
    },
    { name: "DM Sans", category: "Sans-serif", googleName: "DM+Sans" },
    {
        name: "Plus Jakarta Sans",
        category: "Sans-serif",
        googleName: "Plus+Jakarta+Sans",
    },
    {
        name: "Playfair Display",
        category: "Serif",
        googleName: "Playfair+Display",
    },
    { name: "Lora", category: "Serif", googleName: "Lora" },
    { name: "Source Serif 4", category: "Serif", googleName: "Source+Serif+4" },
    { name: "Merriweather", category: "Serif", googleName: "Merriweather" },
    {
        name: "JetBrains Mono",
        category: "Monospace",
        googleName: "JetBrains+Mono",
    },
    { name: "Fira Code", category: "Monospace", googleName: "Fira+Code" },
    {
        name: "IBM Plex Mono",
        category: "Monospace",
        googleName: "IBM+Plex+Mono",
    },
    { name: "Syne", category: "Display", googleName: "Syne" },
];

const FONT_TYPES: Array<FontCategory | "All Types"> = [
    "All Types",
    "Sans-serif",
    "Serif",
    "Monospace",
    "Display",
];

/** Curated heading/body pairings shown as one-click preset cards. */
const BUILT_IN_PAIRINGS: FontPairing[] = [
    { name: "Modern", heading: "Space Grotesk", body: "Inter" },
    { name: "Editorial", heading: "Playfair Display", body: "Source Serif 4" },
    { name: "Friendly", heading: "Plus Jakarta Sans", body: "DM Sans" },
    { name: "Classic", heading: "Merriweather", body: "Lora" },
    { name: "Technical", heading: "IBM Plex Mono", body: "Inter" },
    { name: "Bold", heading: "Syne", body: "Outfit" },
];

const DEFAULT_HEADING_FONT = "Inter";
const DEFAULT_BODY_FONT = "Source Serif 4";

const GOOGLE_FONTS_URL =
    "https://fonts.googleapis.com/css2?" +
    APPROVED_FONTS.map(
        (font) => `family=${font.googleName}:wght@400;600;700`,
    ).join("&") +
    "&display=swap";

const SPECIMEN_HEADING = "Build Better Work, Then Show It Well";
const SPECIMEN_BODY =
    "Typography defines the pace and clarity of your portfolio. A strong heading creates structure, and the body type needs to stay effortless to read.";

/**
 * Font pairing picker for the style chat. Mirrors ColorPickerPanel:
 * a Presets tab with one-click pairing cards in a carousel (AI pick first)
 * and a Custom tab for assigning heading/body fonts individually. Shares
 * its chrome with the color picker via picker-styles.
 */
export const TypographyPickerPanel = ({
    onSubmit,
    recommendedHeadingFont,
    recommendedBodyFont,
}: TypographyPickerPanelProps) => {
    const [headingFont, setHeadingFont] = useState<string>(
        recommendedHeadingFont ?? DEFAULT_HEADING_FONT,
    );
    const [bodyFont, setBodyFont] = useState<string>(
        recommendedBodyFont ?? DEFAULT_BODY_FONT,
    );
    const [typeFilter, setTypeFilter] = useState<FontCategory | "All Types">(
        "All Types",
    );
    const [activeTab, setActiveTab] = useState<PickerTab>("presets");
    // The AI pairing can share its fonts with a built-in pairing, so font
    // equality alone would highlight two cards; remember the clicked card.
    const [selectedPairingId, setSelectedPairingId] = useState<string | null>(
        recommendedHeadingFont || recommendedBodyFont ? "ai" : null,
    );
    // Scopes the shared selection-underline layoutId to this panel instance,
    // since the style chat can mount more than one picker at a time.
    const layoutGroupId = useId();

    useEffect(() => {
        const existingLink = document.querySelector(
            `link[href="${GOOGLE_FONTS_URL}"]`,
        );

        if (!existingLink) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = GOOGLE_FONTS_URL;
            document.head.appendChild(link);
        }
    }, []);

    const aiPairing = useMemo<FontPairing | null>(() => {
        if (!recommendedHeadingFont && !recommendedBodyFont) return null;
        return {
            name: "AI Pick",
            heading: recommendedHeadingFont ?? DEFAULT_HEADING_FONT,
            body: recommendedBodyFont ?? DEFAULT_BODY_FONT,
        };
    }, [recommendedHeadingFont, recommendedBodyFont]);

    const isRecommendedFont = (fontName: string) =>
        fontName === recommendedHeadingFont ||
        fontName === recommendedBodyFont;

    const filteredFonts = APPROVED_FONTS.filter(
        (font) => typeFilter === "All Types" || font.category === typeFilter,
    ).sort(
        (a, b) =>
            Number(isRecommendedFont(b.name)) -
            Number(isRecommendedFont(a.name)),
    );

    const selectPairing = (id: string, pairing: FontPairing) => {
        setSelectedPairingId(id);
        setHeadingFont(pairing.heading);
        setBodyFont(pairing.body);
    };

    // A card is selected only if it was the one clicked and the fonts still
    // match (custom tab edits can break the pairing without clearing the id).
    const isPairingSelected = (id: string, pairing: FontPairing) =>
        selectedPairingId === id &&
        headingFont === pairing.heading &&
        bodyFont === pairing.body;

    const renderFontRow = (font: FontEntry) => {
        const isHeadingSelected = headingFont === font.name;
        const isBodySelected = bodyFont === font.name;

        return (
            <article
                key={font.name}
                className={cn(
                    "w-full rounded-lg border px-4 py-4 transition",
                    isHeadingSelected || isBodySelected
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-neutral-200 hover:border-neutral-300 dark:border-white/10 dark:hover:border-white/25",
                )}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3
                                className="text-xl text-neutral-900 dark:text-white"
                                style={{
                                    fontFamily: `'${font.name}', sans-serif`,
                                }}
                            >
                                {font.name}
                            </h3>
                            <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55">
                                {font.category}
                            </span>
                            {isRecommendedFont(font.name) && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary-foreground">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    AI Pick
                                </span>
                            )}
                        </div>
                        <p
                            className="mt-2 truncate text-sm text-neutral-600 dark:text-white/65"
                            style={{ fontFamily: `'${font.name}', sans-serif` }}
                        >
                            Sphinx of black quartz, judge my vow.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setHeadingFont(font.name)}
                            className={cn(
                                "h-9 cursor-pointer rounded-full border px-4 text-sm",
                                isHeadingSelected
                                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                    : "border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06] dark:hover:text-white",
                            )}
                        >
                            {isHeadingSelected && (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            Heading
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setBodyFont(font.name)}
                            className={cn(
                                "h-9 cursor-pointer rounded-full border px-4 text-sm",
                                isBodySelected
                                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                    : "border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06] dark:hover:text-white",
                            )}
                        >
                            {isBodySelected && <Check className="mr-2 h-4 w-4" />}
                            Body
                        </Button>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <div className={PICKER_PANEL_CLASSES}>
            <div className="space-y-6 rounded-md p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className={PICKER_HEADING_CLASSES}>
                            Typography Studio
                        </h2>
                        <p className={PICKER_BODY_CLASSES}>
                            Pick a pairing or fine-tune each font.
                        </p>
                    </div>

                    <div className={TOGGLE_SHELL_CLASSES}>
                        <button
                            type="button"
                            onClick={() => setActiveTab("presets")}
                            className={cn(
                                "px-4 py-2 text-sm",
                                toggleButtonClasses(activeTab === "presets"),
                            )}
                        >
                            Presets
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("custom")}
                            className={cn(
                                "px-4 py-2 text-sm",
                                toggleButtonClasses(activeTab === "custom"),
                            )}
                        >
                            Custom
                        </button>
                    </div>
                </div>

                {activeTab === "presets" ? (
                    <LayoutGroup id={layoutGroupId}>
                        <PaletteCarousel>
                            {aiPairing && (
                                <FontPairingCard
                                    pairing={aiPairing}
                                    isSelected={isPairingSelected(
                                        "ai",
                                        aiPairing,
                                    )}
                                    isRecommended
                                    onSelect={() =>
                                        selectPairing("ai", aiPairing)
                                    }
                                />
                            )}
                            {BUILT_IN_PAIRINGS.map((pairing) => (
                                <FontPairingCard
                                    key={pairing.name}
                                    pairing={pairing}
                                    isSelected={isPairingSelected(
                                        pairing.name,
                                        pairing,
                                    )}
                                    onSelect={() =>
                                        selectPairing(pairing.name, pairing)
                                    }
                                />
                            ))}
                        </PaletteCarousel>
                    </LayoutGroup>
                ) : (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className={TOGGLE_SHELL_CLASSES}>
                                {FONT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setTypeFilter(type)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs whitespace-nowrap",
                                            toggleButtonClasses(
                                                typeFilter === type,
                                            ),
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-white/45">
                                Showing {filteredFonts.length} fonts
                            </span>
                        </div>

                        <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400/40 [&::-webkit-scrollbar-thumb]:hover:bg-neutral-400/60 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 dark:[&::-webkit-scrollbar-thumb]:hover:bg-white/20">
                            {filteredFonts.length > 0 ? (
                                filteredFonts.map((font) => renderFontRow(font))
                            ) : (
                                <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500 dark:border-white/15 dark:text-white/55">
                                    No fonts match the current filters.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <section className="space-y-4 rounded-lg border border-neutral-200 p-5 md:p-6 dark:border-white/10">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-white/50">
                        <span className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.04]">
                            Heading:{" "}
                            <span className="font-medium text-neutral-900 dark:text-white/85">
                                {headingFont}
                            </span>
                        </span>
                        <span className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.04]">
                            Body:{" "}
                            <span className="font-medium text-neutral-900 dark:text-white/85">
                                {bodyFont}
                            </span>
                        </span>
                    </div>
                    <h2
                        className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white"
                        style={{ fontFamily: `'${headingFont}', sans-serif` }}
                    >
                        {SPECIMEN_HEADING}
                    </h2>
                    <p
                        className="max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-[15px] dark:text-white/70"
                        style={{ fontFamily: `'${bodyFont}', sans-serif` }}
                    >
                        {SPECIMEN_BODY}
                    </p>
                </section>

                <Button
                    type="button"
                    onClick={() =>
                        onSubmit({ heading: headingFont, body: bodyFont })
                    }
                    className={PICKER_CONFIRM_CLASSES}
                >
                    Confirm Fonts
                </Button>
            </div>
        </div>
    );
};
