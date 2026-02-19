"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface ColorPickerPanelProps {
  onSubmit: (colors: Record<string, string>) => void;
}

type Palette = {
  name: string;
  colors: Record<string, string>;
};

const PRESET_PALETTES = [
  {
    name: "Ocean Blues",
    colors: { primary: "#0077B6", secondary: "#00B4D8", accent: "#90E0EF", background: "#CAF0F8", text: "#03045E" },
  },
  {
    name: "Warm Earth",
    colors: { primary: "#BC6C25", secondary: "#DDA15E", accent: "#FEFAE0", background: "#FAF3E0", text: "#283618" },
  },
  {
    name: "Forest Green",
    colors: { primary: "#2D6A4F", secondary: "#52B788", accent: "#95D5B2", background: "#D8F3DC", text: "#1B4332" },
  },
  {
    name: "Sunset Glow",
    colors: { primary: "#E63946", secondary: "#F4A261", accent: "#E9C46A", background: "#FFF8F0", text: "#264653" },
  },
  {
    name: "Monochrome",
    colors: { primary: "#212529", secondary: "#495057", accent: "#ADB5BD", background: "#F8F9FA", text: "#212529" },
  },
  {
    name: "Purple Haze",
    colors: { primary: "#7B2CBF", secondary: "#9D4EDD", accent: "#C77DFF", background: "#F3E8FF", text: "#240046" },
  },
];

const COLOR_FIELDS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "text", label: "Text" },
] as const;

const DEFAULT_COLORS: Record<string, string> = {
  primary: "#3B82F6",
  secondary: "#6366F1",
  accent: "#8B5CF6",
  background: "#F8FAFC",
  text: "#1E293B",
};

type ThemeMode = "light" | "dark";
const CUSTOMIZE_PALETTE_KEY = "customize-palette";
const WHITE_CUSTOM_COLORS: Record<string, string> = {
  primary: "#FFFFFF",
  secondary: "#FFFFFF",
  accent: "#FFFFFF",
  background: "#FFFFFF",
  text: "#FFFFFF",
};

export function ColorPickerPanel({ onSubmit }: ColorPickerPanelProps) {
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  const applyThemeToColors = (
    paletteColors: Record<string, string>,
    mode: ThemeMode,
  ) => {
    if (mode === "light") {
      return { ...paletteColors };
    }

    return {
      ...paletteColors,
      background: "#0B1220",
      text: "#E2E8F0",
    };
  };

  const handlePresetClick = (preset: Palette) => {
    setColors(applyThemeToColors(preset.colors, themeMode));
    setSelectedPreset(`preset:${preset.name}`);
  };

  const handleCustomizePaletteClick = () => {
    setColors({ ...WHITE_CUSTOM_COLORS });
    setSelectedPreset(CUSTOMIZE_PALETTE_KEY);
  };

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setSelectedPreset(null);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);

    if (!selectedPreset) return;

    if (selectedPreset === CUSTOMIZE_PALETTE_KEY) {
      setColors({ ...WHITE_CUSTOM_COLORS });
      return;
    }

    const selectedKey = selectedPreset.split(":")[1];
    if (!selectedKey) return;
    const activePreset = PRESET_PALETTES.find(
      (preset) => preset.name === selectedKey,
    );
    if (!activePreset) return;

    setColors(applyThemeToColors(activePreset.colors, mode));
  };

  const getCardSurfaceClasses = () =>
    themeMode === "light"
      ? "border-black/15 bg-white/70 text-black hover:border-black/30"
      : "border-white/15 bg-black text-white hover:border-white/30";

  const getSectionTitleClasses = () =>
    themeMode === "light" ? "text-black/85" : "text-white/85";

  const getToggleWrapClasses = () =>
    themeMode === "light"
      ? "border-black/15 bg-black/5"
      : "border-white/10 bg-black/20";

  const getToggleInactiveClasses = () =>
    themeMode === "light"
      ? "text-black/60 hover:text-black"
      : "text-white/70 hover:text-white";

  const renderColorControl = (
    key: string,
    label: string,
  ) => (
    <div
      key={key}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        themeMode === "light"
          ? "border-black/15 bg-black/5"
          : "border-white/10 bg-black/20"
      }`}
    >
      <label
        htmlFor={`color-${key}`}
        className={`text-sm ${
          themeMode === "light" ? "text-black/85" : "text-white/85"
        }`}
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <span
          className={`font-mono text-xs ${
            themeMode === "light" ? "text-black/60" : "text-white/60"
          }`}
        >
          {colors[key]?.toUpperCase()}
        </span>
        <input
          id={`color-${key}`}
          type="color"
          value={colors[key]}
          onChange={(e) => handleColorChange(key, e.target.value)}
          className={`h-10 w-10 cursor-pointer rounded-lg bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none ${
            themeMode === "light" ? "border border-black/20" : "border border-white/20"
          }`}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border p-6 md:p-8 ${
        themeMode === "light"
          ? "border-zinc-600/45 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 shadow-[0_0_35px_rgba(113,113,122,0.5)]"
          : "border-zinc-500/40 bg-gradient-to-b from-[#3A3A3A] via-[#2F2F2F] to-[#252525] shadow-[0_0_30px_rgba(82,82,91,0.38)]"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 md:h-56">
        <svg
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M0,156 C130,74 275,262 430,172 C585,86 730,270 900,170 C1045,92 1125,220 1200,154 L1200,320 L0,320 Z"
            fill={themeMode === "light" ? "#2F2F2F" : "#6B7280"}
            opacity={themeMode === "light" ? 0.98 : 0.82}
          />
        </svg>
      </div>
      <div className="relative z-10 space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <h3 className={`text-base font-semibold leading-6 ${getSectionTitleClasses()}`}>Preset Palettes</h3>
            <div className={`inline-flex rounded-xl border p-1 ${getToggleWrapClasses()}`}>
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                aria-label="Light themed"
                title="Light themed"
                className={`rounded-lg p-2.5 transition ${
                  themeMode === "light"
                    ? "bg-white text-black"
                    : getToggleInactiveClasses()
                }`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                aria-label="Dark themed"
                title="Dark themed"
                className={`rounded-lg p-2.5 transition ${
                  themeMode === "dark"
                    ? "bg-white text-black"
                    : getToggleInactiveClasses()
                }`}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRESET_PALETTES.map((preset) => {
              const previewColors = applyThemeToColors(preset.colors, themeMode);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
                    selectedPreset === `preset:${preset.name}`
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
                      : getCardSurfaceClasses()
                  }`}
                >
                  <div className="flex gap-2">
                    {Object.values(previewColors).map((color, i) => (
                      <div
                        key={i}
                        className={`h-7 w-7 rounded-full ${
                          themeMode === "light"
                            ? "border border-black/20"
                            : "border border-white/20"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-sm ${
                      themeMode === "light" ? "text-black/75" : "text-white/75"
                    }`}
                  >
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleCustomizePaletteClick}
              className={`flex w-full flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
                selectedPreset === CUSTOMIZE_PALETTE_KEY
                  ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
                  : getCardSurfaceClasses()
              }`}
            >
              <div className="flex gap-2">
                {Object.values(WHITE_CUSTOM_COLORS).map((color, i) => (
                  <div
                    key={i}
                    className={`h-7 w-7 rounded-full ${
                      themeMode === "light"
                        ? "border border-black/20"
                        : "border border-white/20"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span
                className={`text-sm ${
                  themeMode === "light" ? "text-black/75" : "text-white/75"
                }`}
              >
                Customize Palette
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className={`min-h-[44px] text-base font-semibold leading-6 ${getSectionTitleClasses()}`}>Customize Colors</h3>
          <div className="space-y-3">
            {COLOR_FIELDS.map((field) =>
              renderColorControl(field.key, field.label),
            )}
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => onSubmit(colors)}
        className="h-12 w-full rounded-2xl bg-blue-600 text-white hover:bg-blue-500"
      >
        Confirm Colors
      </Button>
      </div>
    </div>
  );
}
