"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

interface TypographyPickerPanelProps {
  onSubmit: (fonts: { heading: string; body: string }) => void;
  recommendedHeadingFont?: string;
  recommendedBodyFont?: string;
}

type FontCategory = "Sans-serif" | "Serif" | "Monospace" | "Display";

interface FontEntry {
  name: string;
  category: FontCategory;
  googleName: string; // name for Google Fonts URL
}

const APPROVED_FONTS: FontEntry[] = [
  { name: "Inter", category: "Sans-serif", googleName: "Inter" },
  { name: "Outfit", category: "Sans-serif", googleName: "Outfit" },
  { name: "Space Grotesk", category: "Sans-serif", googleName: "Space+Grotesk" },
  { name: "DM Sans", category: "Sans-serif", googleName: "DM+Sans" },
  { name: "Plus Jakarta Sans", category: "Sans-serif", googleName: "Plus+Jakarta+Sans" },
  { name: "Playfair Display", category: "Serif", googleName: "Playfair+Display" },
  { name: "Lora", category: "Serif", googleName: "Lora" },
  { name: "Source Serif 4", category: "Serif", googleName: "Source+Serif+4" },
  { name: "Merriweather", category: "Serif", googleName: "Merriweather" },
  { name: "JetBrains Mono", category: "Monospace", googleName: "JetBrains+Mono" },
  { name: "Fira Code", category: "Monospace", googleName: "Fira+Code" },
  { name: "IBM Plex Mono", category: "Monospace", googleName: "IBM+Plex+Mono" },
  { name: "Syne", category: "Display", googleName: "Syne" },
];

const CATEGORIES: FontCategory[] = ["Sans-serif", "Serif", "Monospace", "Display"];

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  APPROVED_FONTS.map((f) => `family=${f.googleName}:wght@400;600;700`).join("&") +
  "&display=swap";

export function TypographyPickerPanel({
  onSubmit,
  recommendedHeadingFont,
  recommendedBodyFont,
}: TypographyPickerPanelProps) {
  const [headingFont, setHeadingFont] = useState<string>(
    recommendedHeadingFont ?? "Inter"
  );
  const [bodyFont, setBodyFont] = useState<string>(
    recommendedBodyFont ?? "Inter"
  );

  // Load Google Fonts
  useEffect(() => {
    const existingLink = document.querySelector(
      `link[href="${GOOGLE_FONTS_URL}"]`
    );
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  const renderFontCard = (
    font: FontEntry,
    selected: boolean,
    recommended: boolean,
    onClick: () => void
  ) => (
    <button
      key={font.name}
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
        selected
          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
          : "border-white/15 bg-white/5 hover:border-white/30"
      }`}
    >
      {recommended && (
        <span className="absolute -top-2 right-2 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
          <Sparkles className="h-3 w-3" />
          Recommended
        </span>
      )}
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
          <Check className="h-3 w-3 text-white" />
        </span>
      )}
      <span
        className="text-lg text-white/90"
        style={{ fontFamily: `'${font.name}', sans-serif` }}
      >
        {font.name}
      </span>
      <span className="text-[11px] text-white/40">{font.category}</span>
    </button>
  );

  const renderSection = (
    label: string,
    selectedFont: string,
    setFont: (f: string) => void,
    recommendedFont?: string
  ) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/85">{label}</h3>
      {CATEGORIES.map((category) => {
        const fonts = APPROVED_FONTS.filter((f) => f.category === category);
        if (fonts.length === 0) return null;
        return (
          <div key={category}>
            <p className="mb-2 text-xs font-medium text-white/50">{category}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {fonts.map((font) =>
                renderFontCard(
                  font,
                  selectedFont === font.name,
                  recommendedFont === font.name,
                  () => setFont(font.name)
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black p-6 md:p-8">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-44">
        <svg
          viewBox="0 0 1200 260"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M0,128 C130,60 275,218 430,142 C585,72 730,228 900,140 C1045,72 1125,190 1200,126 L1200,260 L0,260 Z"
            fill="#6B7280"
            opacity={0.82}
          />
        </svg>
      </div>

      <div className="relative z-10 space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {renderSection(
            "Heading Font",
            headingFont,
            setHeadingFont,
            recommendedHeadingFont
          )}
          {renderSection(
            "Body Font",
            bodyFont,
            setBodyFont,
            recommendedBodyFont
          )}
        </div>

        {/* Live Preview */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-medium text-white/50">Live Preview</p>
          <h2
            className="text-2xl font-bold text-white/90"
            style={{ fontFamily: `'${headingFont}', sans-serif` }}
          >
            The quick brown fox jumps over the lazy dog
          </h2>
          <p
            className="text-sm leading-relaxed text-white/70"
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
          >
            Typography is the art and technique of arranging type to make written
            language legible, readable, and appealing when displayed. The
            arrangement of type involves selecting typefaces, point sizes, line
            lengths, line-spacing, and letter-spacing.
          </p>
          <div className="flex gap-4 pt-2 text-xs text-white/40">
            <span>
              Heading:{" "}
              <span className="text-white/60">{headingFont}</span>
            </span>
            <span>
              Body:{" "}
              <span className="text-white/60">{bodyFont}</span>
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => onSubmit({ heading: headingFont, body: bodyFont })}
          className="h-12 w-full rounded-2xl bg-blue-600 text-white hover:bg-blue-500"
        >
          Confirm Fonts
        </Button>
      </div>
    </div>
  );
}
