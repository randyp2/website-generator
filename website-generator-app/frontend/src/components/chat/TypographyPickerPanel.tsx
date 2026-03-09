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
      className={`group relative flex min-h-[84px] flex-col justify-between rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        selected
          ? "border-white/45 bg-white/[0.07]"
          : "border-white/15 bg-transparent hover:border-white/30 hover:bg-white/[0.03]"
      }`}
      aria-pressed={selected}
    >
      {recommended && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/75">
          <Sparkles className="h-3 w-3" />
          AI Recommended
        </span>
      )}
      {selected && (
        <span className="absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border border-white/35 bg-white/10">
          <Check className="h-3 w-3 text-white/90" />
        </span>
      )}
      <div className="pr-24">
        <span
          className={`block text-lg ${
            selected ? "text-white" : "text-white/85"
          }`}
          style={{ fontFamily: `'${font.name}', sans-serif` }}
        >
          {font.name}
        </span>
        <span className="block pt-1 text-xs uppercase tracking-[0.16em] text-white/45">
          {font.category}
        </span>
      </div>
      <p
        className="mt-3 line-clamp-1 text-[13px] text-white/55 group-hover:text-white/70"
        style={{ fontFamily: `'${font.name}', sans-serif` }}
      >
        Sphinx of black quartz, judge my vow.
      </p>
    </button>
  );

  const renderSection = (
    label: string,
    selectedFont: string,
    setFont: (f: string) => void,
    recommendedFont?: string
  ) => (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">
        {label}
      </h3>
      {CATEGORIES.map((category) => {
        const fonts = APPROVED_FONTS.filter((f) => f.category === category);
        if (fonts.length === 0) return null;
        return (
          <div key={category} className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
              {category}
            </p>
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
    </section>
  );

  return (
    <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-black/70 p-6 md:p-8">
      <div className="space-y-8">
        <div className="space-y-1 border-b border-white/10 pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Typography Picker
          </p>
          <h2 className="text-xl font-semibold text-white/90 md:text-2xl">
            Choose Your Font Pairing
          </h2>
          <p className="text-sm text-white/60">
            Select heading and body fonts with live specimens and AI recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2 xl:gap-10">
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

        <section className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.02] p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">Live Specimen</p>
          <h2
            className="text-3xl font-bold tracking-tight text-white/90 md:text-4xl"
            style={{ fontFamily: `'${headingFont}', sans-serif` }}
          >
            Build Better Work, Then Show It Well
          </h2>
          <p
            className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-[15px]"
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
          >
            Typography defines the pace and clarity of your portfolio. A strong heading
            style should create immediate structure, while the body type should stay
            effortless to read across project descriptions and case studies.
          </p>
          <div
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/65"
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
              UI Microcopy
            </p>
            <p className="mt-2">Selected template • Last updated just now • Continue</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1 text-xs text-white/50">
            <span>
              Heading:{" "}
              <span className="font-medium text-white/80">{headingFont}</span>
            </span>
            <span>
              Body:{" "}
              <span className="font-medium text-white/80">{bodyFont}</span>
            </span>
          </div>
        </section>

        <Button
          type="button"
          onClick={() => onSubmit({ heading: headingFont, body: bodyFont })}
          className="h-12 w-full rounded-2xl border border-white/20 bg-white text-black hover:bg-white/90"
        >
          Confirm Fonts
        </Button>
      </div>
    </div>
  );
}
