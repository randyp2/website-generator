"use client";

import { Moon, Palette, RefreshCw, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColorSwatchField } from "./color-picker/ColorSwatchField";
import { ColorWheel } from "./color-picker/ColorWheel";
import {
    COLOR_LABELS,
    DEFAULT_CUSTOM_PALETTE,
    DEFAULT_THEME_MODE,
    PRESET_PALETTES,
} from "./color-picker/constants";
import { PalettePreviewCard } from "./color-picker/PalettePreviewCard";
import { PresetPaletteCard } from "./color-picker/PresetPaletteCard";
import {
    COLOR_KEYS,
    type ColorKey,
    type ColorPickerPanelProps,
    type PaletteColors,
    type RecommendedColorPreset,
} from "./color-picker/types";

type ThemeMode = "dark" | "light";
type PickerTab = "presets" | "custom";

const randomHex = () =>
    `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;

const createRandomPalette = (): PaletteColors => ({
    primary: randomHex(),
    secondary: randomHex(),
    accent: randomHex(),
    background: randomHex(),
    text: randomHex(),
    muted: randomHex(),
});

export const ColorPickerPanel = ({
    onSubmit,
    recommendedPresets = [],
}: ColorPickerPanelProps) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
    const [selectedPaletteName, setSelectedPaletteName] = useState<string>(
        PRESET_PALETTES[0].name,
    );
    const [selectedAiPresetName, setSelectedAiPresetName] = useState<string | null>(
        null,
    );
    const [hasExplicitPresetChoice, setHasExplicitPresetChoice] = useState(false);
    const [customPalette, setCustomPalette] = useState<PaletteColors>(
        DEFAULT_CUSTOM_PALETTE,
    );
    const [activeColorKey, setActiveColorKey] = useState<ColorKey>("primary");
    const [activeTab, setActiveTab] = useState<PickerTab>("presets");

    const selectedPalette = useMemo(
        () =>
            PRESET_PALETTES.find(
                (palette) => palette.name === selectedPaletteName,
            ) ?? PRESET_PALETTES[0],
        [selectedPaletteName],
    );

    const effectiveSelectedAiPresetName = useMemo(() => {
        if (recommendedPresets.length === 0) return null;
        if (!hasExplicitPresetChoice) return recommendedPresets[0].name;
        if (
            selectedAiPresetName &&
            recommendedPresets.some((preset) => preset.name === selectedAiPresetName)
        ) {
            return selectedAiPresetName;
        }
        return null;
    }, [recommendedPresets, selectedAiPresetName, hasExplicitPresetChoice]);

    const selectedAiPreset = useMemo(
        () =>
            recommendedPresets.find(
                (preset) => preset.name === effectiveSelectedAiPresetName,
            ) ?? null,
        [recommendedPresets, effectiveSelectedAiPresetName],
    );

    const currentColors =
        activeTab === "custom"
            ? customPalette
            : selectedAiPreset?.colors ?? selectedPalette[themeMode];

    const handleCustomColorChange = (key: ColorKey, color: string) => {
        setCustomPalette((previousPalette) => ({
            ...previousPalette,
            [key]: color,
        }));
    };

    const handleRandomize = () => {
        setCustomPalette(createRandomPalette());
    };

    return (
        <div
            className={cn(
                "w-full overflow-hidden rounded-[2rem] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:p-6",
                themeMode === "light"
                    ? "border border-slate-300/70 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_35%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(226,232,240,0.94))] text-slate-950"
                    : "border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_38%),linear-gradient(180deg,rgba(9,9,11,0.98),rgba(16,24,40,0.96))] text-white",
            )}
        >
            <div className="rounded-[1.75rem]  p-5">
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "flex h-20 w-20 items-center justify-center text-blue-200",
                                themeMode === "light"
                                    ? "text-slate-700"
                                    : "text-blue-200",
                            )}
                        >
                            <Palette className="h-15 w-15" />
                        </div>
                        <div>
                            <h2
                                className={cn(
                                    "text-lg font-semibold",
                                    themeMode === "light"
                                        ? "text-slate-950"
                                        : "text-white",
                                )}
                            >
                                Color Palette Studio
                            </h2>
                            <p
                                className={cn(
                                    "text-sm",
                                    themeMode === "light"
                                        ? "text-slate-600"
                                        : "text-white/55",
                                )}
                            >
                                Pick a preset or build a custom palette.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab("presets")}
                                className={cn(
                                    "rounded-xl px-4 py-2 text-sm transition",
                                    activeTab === "presets"
                                        ? "bg-white text-black"
                                        : "text-white/70 hover:text-white",
                                )}
                            >
                                Presets
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("custom")}
                                className={cn(
                                    "rounded-xl px-4 py-2 text-sm transition",
                                    activeTab === "custom"
                                        ? "bg-white text-black"
                                        : "text-white/70 hover:text-white",
                                )}
                            >
                                Custom
                            </button>
                        </div>

                        <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
                            <button
                                type="button"
                                onClick={() => setThemeMode("light")}
                                className={cn(
                                    "rounded-xl p-2.5 transition",
                                    themeMode === "light"
                                        ? "bg-white text-black"
                                        : "text-white/70 hover:text-white",
                                )}
                                aria-label="Use light mode palette preview"
                            >
                                <Sun className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setThemeMode("dark")}
                                className={cn(
                                    "rounded-xl p-2.5 transition",
                                    themeMode === "dark"
                                        ? "bg-white text-black"
                                        : "text-white/70 hover:text-white",
                                )}
                                aria-label="Use dark mode palette preview"
                            >
                                <Moon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === "presets" ? (
                    <div className="space-y-6">
                        {recommendedPresets.length > 0 && (
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-amber-300/30 bg-linear-to-r from-amber-300/12 via-orange-300/10 to-transparent px-4 py-3 text-amber-50">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100/80">
                                        AI Generated Palettes
                                    </p>
                                    <p className="mt-1 text-sm text-amber-50/85">
                                        These are custom palettes generated from your design goal.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {recommendedPresets.map(
                                        (
                                            preset: RecommendedColorPreset,
                                            index: number,
                                        ) => (
                                            <PresetPaletteCard
                                                key={`ai-${preset.name}-${index}`}
                                                name={preset.name}
                                                description={preset.description}
                                                paletteColors={preset.colors}
                                                isSelected={
                                                    effectiveSelectedAiPresetName ===
                                                    preset.name
                                                }
                                                isRecommended
                                                recommendationRank={index + 1}
                                                onSelect={() => {
                                                    setHasExplicitPresetChoice(
                                                        true,
                                                    );
                                                    setSelectedAiPresetName(
                                                        preset.name,
                                                    );
                                                }}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                                Built-in Presets
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {PRESET_PALETTES.map((palette) => (
                                    <PresetPaletteCard
                                        key={palette.name}
                                        name={palette.name}
                                        description={palette.description}
                                        paletteColors={palette.dark}
                                        isSelected={
                                            effectiveSelectedAiPresetName === null &&
                                            selectedPalette.name === palette.name
                                        }
                                        onSelect={() => {
                                            setHasExplicitPresetChoice(true);
                                            setSelectedAiPresetName(null);
                                            setSelectedPaletteName(palette.name);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <PalettePreviewCard colors={currentColors} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-white">
                                    Custom Palette
                                </h3>
                                <p className="text-sm text-white/55">
                                    Build and fine-tune each color role.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                onClick={handleRandomize}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Randomize
                            </Button>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {COLOR_KEYS.map((key) => (
                                    <ColorSwatchField
                                        key={key}
                                        color={customPalette[key]}
                                        label={COLOR_LABELS[key]}
                                        isSelected={activeColorKey === key}
                                        isEditable
                                        onSelect={() => setActiveColorKey(key)}
                                        onColorChange={(color) =>
                                            handleCustomColorChange(key, color)
                                        }
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
                                <p className="mb-4 text-sm text-white/65">
                                    Editing{" "}
                                    <span className="font-semibold text-blue-300">
                                        {COLOR_LABELS[activeColorKey]}
                                    </span>
                                </p>
                                <ColorWheel
                                    selectedColor={
                                        customPalette[activeColorKey]
                                    }
                                    onColorSelect={(color) =>
                                        handleCustomColorChange(
                                            activeColorKey,
                                            color,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <PalettePreviewCard colors={currentColors} />
                    </div>
                )}

                <div className="mt-6">
                    <Button
                        type="button"
                        onClick={() => onSubmit(currentColors)}
                        className="h-12 w-full rounded-2xl bg-blue-600 text-white hover:bg-blue-500"
                    >
                        Confirm Colors
                    </Button>
                </div>
            </div>
        </div>
    );
};
