"use client";

import type { ColorKey, PaletteColors, ThemedPalette } from "./types";

export const DEFAULT_THEME_MODE = "dark" as const;

export const DEFAULT_CUSTOM_PALETTE: PaletteColors = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#f43f5e",
    background: "#0f172a",
    text: "#f8fafc",
    muted: "#64748b",
};

export const COLOR_LABELS: Record<ColorKey, string> = {
    primary: "Primary",
    secondary: "Secondary",
    accent: "Accent",
    background: "Background",
    text: "Text",
    muted: "Muted",
};

export const PRESET_PALETTES: ThemedPalette[] = [
    {
        name: "Midnight",
        description: "Dark and professional",
        dark: {
            primary: "#6366f1",
            secondary: "#8b5cf6",
            accent: "#f43f5e",
            background: "#0f172a",
            text: "#f8fafc",
            muted: "#64748b",
        },
        light: {
            primary: "#4f46e5",
            secondary: "#7c3aed",
            accent: "#e11d48",
            background: "#f8fafc",
            text: "#0f172a",
            muted: "#94a3b8",
        },
    },
    {
        name: "Forest",
        description: "Natural and calm",
        dark: {
            primary: "#22c55e",
            secondary: "#14b8a6",
            accent: "#eab308",
            background: "#052e16",
            text: "#f0fdf4",
            muted: "#4ade80",
        },
        light: {
            primary: "#16a34a",
            secondary: "#0d9488",
            accent: "#ca8a04",
            background: "#f0fdf4",
            text: "#052e16",
            muted: "#86efac",
        },
    },
    {
        name: "Ocean",
        description: "Cool and serene",
        dark: {
            primary: "#0ea5e9",
            secondary: "#06b6d4",
            accent: "#f97316",
            background: "#0c4a6e",
            text: "#f0f9ff",
            muted: "#7dd3fc",
        },
        light: {
            primary: "#0284c7",
            secondary: "#0891b2",
            accent: "#ea580c",
            background: "#f0f9ff",
            text: "#0c4a6e",
            muted: "#7dd3fc",
        },
    },
    {
        name: "Sunset",
        description: "Warm and inviting",
        dark: {
            primary: "#f97316",
            secondary: "#f43f5e",
            accent: "#fbbf24",
            background: "#1c1917",
            text: "#fafaf9",
            muted: "#a8a29e",
        },
        light: {
            primary: "#ea580c",
            secondary: "#e11d48",
            accent: "#d97706",
            background: "#fafaf9",
            text: "#1c1917",
            muted: "#d6d3d1",
        },
    },
    {
        name: "Minimal",
        description: "Clean and modern",
        dark: {
            primary: "#f4f4f5",
            secondary: "#a1a1aa",
            accent: "#3b82f6",
            background: "#09090b",
            text: "#fafafa",
            muted: "#52525b",
        },
        light: {
            primary: "#18181b",
            secondary: "#3f3f46",
            accent: "#3b82f6",
            background: "#ffffff",
            text: "#09090b",
            muted: "#a1a1aa",
        },
    },
    {
        name: "Rose",
        description: "Elegant and soft",
        dark: {
            primary: "#e11d48",
            secondary: "#be185d",
            accent: "#fda4af",
            background: "#1f1f1f",
            text: "#fff1f2",
            muted: "#9f1239",
        },
        light: {
            primary: "#be123c",
            secondary: "#9d174d",
            accent: "#fb7185",
            background: "#fff1f2",
            text: "#1f1f1f",
            muted: "#fecdd3",
        },
    },
];
