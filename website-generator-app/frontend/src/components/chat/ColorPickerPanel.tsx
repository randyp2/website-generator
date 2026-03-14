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

export const ColorPickerPanel = ({ onSubmit }: ColorPickerPanelProps) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
    const [selectedPaletteName, setSelectedPaletteName] = useState<string>(
        PRESET_PALETTES[0].name,
    );
    const [customPalette, setCustomPalette] =
        useState<PaletteColors>(DEFAULT_CUSTOM_PALETTE);
    const [activeColorKey, setActiveColorKey] = useState<ColorKey>("primary");
    const [activeTab, setActiveTab] = useState<PickerTab>("presets");

    const selectedPalette = useMemo(
        () =>
            PRESET_PALETTES.find((palette) => palette.name === selectedPaletteName) ??
            PRESET_PALETTES[0],
        [selectedPaletteName],
    );

    const currentColors =
        activeTab === "custom" ? customPalette : selectedPalette[themeMode];

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
                "w-full overflow-hidden rounded-[2rem] border border-white/10 p-4 text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:p-6",
                "bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_38%),linear-gradient(180deg,rgba(9,9,11,0.98),rgba(16,24,40,0.96))]",
            )}
        >
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                                <Palette className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Color Palette Studio
                                </h2>
                                <p className="text-sm text-white/55">
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
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {PRESET_PALETTES.map((palette) => (
                                    <PresetPaletteCard
                                        key={palette.name}
                                        palette={palette}
                                        paletteColors={palette[themeMode]}
                                        isSelected={
                                            selectedPalette.name === palette.name
                                        }
                                        onSelect={() =>
                                            setSelectedPaletteName(palette.name)
                                        }
                                    />
                                ))}
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
                                            onSelect={() =>
                                                setActiveColorKey(key)
                                            }
                                            onColorChange={(color) =>
                                                handleCustomColorChange(
                                                    key,
                                                    color,
                                                )
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
