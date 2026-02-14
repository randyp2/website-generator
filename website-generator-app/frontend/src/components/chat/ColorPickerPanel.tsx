"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ColorPickerPanelProps {
  onSubmit: (colors: Record<string, string>) => void;
}

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

export function ColorPickerPanel({ onSubmit }: ColorPickerPanelProps) {
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (preset: (typeof PRESET_PALETTES)[number]) => {
    setColors({ ...preset.colors });
    setSelectedPreset(preset.name);
  };

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setSelectedPreset(null);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div>
        <h3 className="mb-3 text-sm font-medium text-white/80">Preset Palettes</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESET_PALETTES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                selectedPreset === preset.name
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex gap-1">
                {Object.values(preset.colors).map((color, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs text-white/60">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-white/80">Customize Colors</h3>
        <div className="grid grid-cols-5 gap-3">
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <label
                htmlFor={`color-${key}`}
                className="cursor-pointer"
              >
                <input
                  id={`color-${key}`}
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-white/20 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                />
              </label>
              <span className="text-[10px] text-white/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => onSubmit(colors)}
        className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-500"
      >
        Confirm Colors
      </Button>
    </div>
  );
}
