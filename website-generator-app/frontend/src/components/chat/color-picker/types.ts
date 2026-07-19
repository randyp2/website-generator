"use client";

export const COLOR_KEYS = [
    "primary",
    "secondary",
    "accent",
    "background",
    "text",
    "muted",
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number];

export type PaletteColors = Record<ColorKey, string>;

export type ColorPickerSurfaceMode = "dark" | "light";

export interface ThemedPalette {
    name: string;
    description: string;
    light: PaletteColors;
    dark: PaletteColors;
}

export interface RecommendedColorPreset {
    name: string;
    description: string;
    colors: PaletteColors;
}

export interface ColorPickerPanelProps {
    onSubmit: (colors: Record<string, string>) => void;
    recommendedPresets?: RecommendedColorPreset[];
}
