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

const getAiPaletteForTheme = (
    colors: PaletteColors,
    themeMode: ThemeMode,
): PaletteColors => {
    if (themeMode === "dark") {
        return colors;
    }

    return {
        ...colors,
        background: colors.text,
        text: colors.background,
        muted: `${colors.background}b3`,
    };
};

const PICKER_THEME_STYLES = {
    dark: {
        panel: {
            backgroundColor: "#0f0f0f",
            borderColor: "#404040",
            color: "#e5e5e5",
        },
        heading: "#ffffff",
        body: "rgba(229,229,229,0.62)",
        icon: "#bfdbfe",
        toggleShell: "rgba(0,0,0,0.2)",
        toggleBorder: "rgba(255,255,255,0.1)",
        toggleActiveBg: "#ffffff",
        toggleActiveText: "#000000",
        toggleIdleText: "rgba(255,255,255,0.7)",
        toggleIdleHoverText: "#ffffff",
        sectionLabel: "rgba(255,255,255,0.45)",
    },
    light: {
        panel: {
            backgroundColor: "#f3f4f6",
            borderColor: "#e5e7eb",
            color: "#262626",
        },
        heading: "#0f172a",
        body: "#475569",
        icon: "#94a3b8",
        toggleShell: "rgba(38,38,38,0.12)",
        toggleBorder: "rgba(38,38,38,0.12)",
        toggleActiveBg: "#ffffff",
        toggleActiveText: "#111827",
        toggleIdleText: "#6b7280",
        toggleIdleHoverText: "#111827",
        sectionLabel: "rgba(38,38,38,0.48)",
    },
} as const;

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

    const themedSelectedAiPresetColors = useMemo(
        () =>
            selectedAiPreset
                ? getAiPaletteForTheme(selectedAiPreset.colors, themeMode)
                : null,
        [selectedAiPreset, themeMode],
    );

    const currentColors =
        activeTab === "custom"
            ? customPalette
            : themedSelectedAiPresetColors ?? selectedPalette[themeMode];

    const handleCustomColorChange = (key: ColorKey, color: string) => {
        setCustomPalette((previousPalette) => ({
            ...previousPalette,
            [key]: color,
        }));
    };

    const handleRandomize = () => {
        setCustomPalette(createRandomPalette());
    };

    const pickerTheme = PICKER_THEME_STYLES[themeMode];

    return (
        <div
            className="w-full overflow-hidden rounded-[2rem] border p-4 shadow-[0_30px_80px_rgba(0,0,0,0.28)] md:p-6"
            style={pickerTheme.panel}
        >
            <div className="rounded-[1.75rem] p-5">
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-20 w-20 items-center justify-center"
                            style={{ color: pickerTheme.icon }}
                        >
                            <Palette className="h-15 w-15" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold" style={{ color: pickerTheme.heading }}>
                                Color Palette Studio
                            </h2>
                            <p className="text-sm" style={{ color: pickerTheme.body }}>
                                Pick a preset or build a custom palette.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="inline-flex rounded-2xl border p-1"
                            style={{
                                borderColor: pickerTheme.toggleBorder,
                                backgroundColor: pickerTheme.toggleShell,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setActiveTab("presets")}
                                className="rounded-xl px-4 py-2 text-sm transition"
                                style={
                                    activeTab === "presets"
                                        ? {
                                              backgroundColor: pickerTheme.toggleActiveBg,
                                              color: pickerTheme.toggleActiveText,
                                          }
                                        : {
                                              color: pickerTheme.toggleIdleText,
                                          }
                                }
                                >
                                Presets
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("custom")}
                                className="rounded-xl px-4 py-2 text-sm transition"
                                style={
                                    activeTab === "custom"
                                        ? {
                                              backgroundColor: pickerTheme.toggleActiveBg,
                                              color: pickerTheme.toggleActiveText,
                                          }
                                        : {
                                              color: pickerTheme.toggleIdleText,
                                          }
                                }
                            >
                                Custom
                            </button>
                        </div>

                        <div
                            className="inline-flex rounded-2xl border p-1"
                            style={{
                                borderColor: pickerTheme.toggleBorder,
                                backgroundColor: pickerTheme.toggleShell,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setThemeMode("light")}
                                className="rounded-xl p-2.5 transition"
                                style={
                                    themeMode === "light"
                                        ? {
                                              backgroundColor: pickerTheme.toggleActiveBg,
                                              color: pickerTheme.toggleActiveText,
                                          }
                                        : {
                                              color: pickerTheme.toggleIdleText,
                                          }
                                }
                                aria-label="Use light mode palette preview"
                            >
                                <Sun className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setThemeMode("dark")}
                                className="rounded-xl p-2.5 transition"
                                style={
                                    themeMode === "dark"
                                        ? {
                                              backgroundColor: pickerTheme.toggleActiveBg,
                                              color: pickerTheme.toggleActiveText,
                                          }
                                        : {
                                              color: pickerTheme.toggleIdleText,
                                          }
                                }
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
                                                paletteColors={getAiPaletteForTheme(
                                                    preset.colors,
                                                    themeMode,
                                                )}
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
                            <p
                                className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ color: pickerTheme.sectionLabel }}
                            >
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
