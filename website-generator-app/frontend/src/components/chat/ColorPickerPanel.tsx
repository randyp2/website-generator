"use client";

import { LayoutGroup } from "framer-motion";
import { Moon, RefreshCw, Sun } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    PICKER_BODY_CLASSES,
    PICKER_CONFIRM_CLASSES,
    PICKER_HEADING_CLASSES,
    PICKER_PANEL_CLASSES,
} from "./picker-styles";
import { ColorSwatchField } from "./color-picker/ColorSwatchField";
import {
    COLOR_LABELS,
    DEFAULT_CUSTOM_PALETTE,
    DEFAULT_THEME_MODE,
    PRESET_PALETTES,
} from "./color-picker/constants";
import { PaletteCarousel } from "./color-picker/PaletteCarousel";
import { PaletteThemeCard } from "./color-picker/PaletteThemeCard";
import { PaletteWindowMock } from "./color-picker/PaletteWindowMock";
import {
    COLOR_KEYS,
    type ColorPickerSurfaceMode,
    type ColorKey,
    type ColorPickerPanelProps,
    type PaletteColors,
    type RecommendedColorPreset,
} from "./color-picker/types";

type ThemeMode = ColorPickerSurfaceMode;
type PickerTab = "presets" | "custom";

const SEGMENTED_CONTROL_CLASSES =
    "relative inline-grid grid-cols-2 rounded-full border border-neutral-900/10 bg-neutral-900/5 p-1 dark:border-white/10 dark:bg-black/20";

const SEGMENTED_PILL_CLASSES =
    "pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-white";

const segmentedButtonClasses = (isActive: boolean) =>
    cn(
        "relative z-10 flex h-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors duration-200",
        isActive
            ? "text-neutral-950 dark:text-black"
            : "text-neutral-500 hover:text-neutral-900 dark:text-white/65 dark:hover:text-white",
    );

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

/**
 * Palette picker for the style chat. The panel chrome follows the app's
 * light/dark theme; the picker's own sun/moon toggle only switches which
 * palette variant (light/dark) the mock websites preview.
 */
export const ColorPickerPanel = ({
    onSubmit,
    recommendedPresets = [],
}: ColorPickerPanelProps) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
    const [selectedPaletteName, setSelectedPaletteName] = useState<string>(
        PRESET_PALETTES[0].name,
    );
    const [selectedAiPresetName, setSelectedAiPresetName] = useState<
        string | null
    >(null);
    const [hasExplicitPresetChoice, setHasExplicitPresetChoice] =
        useState(false);
    const [customPalette, setCustomPalette] = useState<PaletteColors>(
        DEFAULT_CUSTOM_PALETTE,
    );
    const [activeTab, setActiveTab] = useState<PickerTab>("presets");
    // Scopes the shared selection-underline layoutId to this panel instance,
    // since the style chat can mount more than one picker at a time.
    const layoutGroupId = useId();

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
            recommendedPresets.some(
                (preset) => preset.name === selectedAiPresetName,
            )
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

    return (
        <div className={PICKER_PANEL_CLASSES}>
            <div className="rounded-md p-5">
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className={PICKER_HEADING_CLASSES}>
                            Color Palette Studio
                        </h2>
                        <p className={PICKER_BODY_CLASSES}>
                            Pick a preset or build a custom palette.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={cn(SEGMENTED_CONTROL_CLASSES, "min-w-[180px]")}>
                            <span
                                className={cn(
                                    SEGMENTED_PILL_CLASSES,
                                    activeTab === "custom" && "translate-x-full",
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setActiveTab("presets")}
                                className={cn(
                                    "px-4",
                                    segmentedButtonClasses(
                                        activeTab === "presets",
                                    ),
                                )}
                            >
                                Presets
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("custom")}
                                className={cn(
                                    "px-4",
                                    segmentedButtonClasses(activeTab === "custom"),
                                )}
                            >
                                Custom
                            </button>
                        </div>

                        <div className={cn(SEGMENTED_CONTROL_CLASSES, "w-[86px]")}>
                            <span
                                className={cn(
                                    SEGMENTED_PILL_CLASSES,
                                    themeMode === "dark" && "translate-x-full",
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setThemeMode("light")}
                                className={cn(
                                    segmentedButtonClasses(themeMode === "light"),
                                    "px-0",
                                )}
                                aria-label="Use light mode palette preview"
                            >
                                <Sun className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setThemeMode("dark")}
                                className={cn(
                                    segmentedButtonClasses(themeMode === "dark"),
                                    "px-0",
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
                        <LayoutGroup id={layoutGroupId}>
                            <PaletteCarousel>
                                {recommendedPresets.map(
                                    (
                                        preset: RecommendedColorPreset,
                                        index: number,
                                    ) => (
                                        <PaletteThemeCard
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
                                            surfaceMode={themeMode}
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
                                {PRESET_PALETTES.map((palette) => (
                                    <PaletteThemeCard
                                        key={palette.name}
                                        name={palette.name}
                                        description={palette.description}
                                        paletteColors={palette[themeMode]}
                                        isSelected={
                                            effectiveSelectedAiPresetName ===
                                                null &&
                                            selectedPalette.name ===
                                                palette.name
                                        }
                                        surfaceMode={themeMode}
                                        onSelect={() => {
                                            setHasExplicitPresetChoice(true);
                                            setSelectedAiPresetName(null);
                                            setSelectedPaletteName(
                                                palette.name,
                                            );
                                        }}
                                    />
                                ))}
                            </PaletteCarousel>
                        </LayoutGroup>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                    Custom Palette
                                </h3>
                                <p className={PICKER_BODY_CLASSES}>
                                    Build and fine-tune each color role.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer rounded-xl border-neutral-300 bg-white/70 text-neutral-800 hover:bg-white hover:text-neutral-950 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                                onClick={handleRandomize}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Randomize
                            </Button>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="flex flex-col justify-center">
                                {COLOR_KEYS.map((key) => (
                                    <ColorSwatchField
                                        key={key}
                                        color={customPalette[key]}
                                        label={COLOR_LABELS[key]}
                                        onColorChange={(color) =>
                                            handleCustomColorChange(key, color)
                                        }
                                    />
                                ))}
                            </div>

                            <div className="flex items-end justify-center overflow-hidden">
                                <PaletteWindowMock
                                    colors={customPalette}
                                    className="h-56"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <Button
                        type="button"
                        onClick={() => onSubmit(currentColors)}
                        className={PICKER_CONFIRM_CLASSES}
                    >
                        Confirm Colors
                    </Button>
                </div>
            </div>
        </div>
    );
};
