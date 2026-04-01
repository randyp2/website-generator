"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

interface TypographyPickerPanelProps {
  onSubmit: (fonts: { heading: string; body: string }) => void;
  recommendedHeadingFont?: string;
  recommendedBodyFont?: string;
}

type FontCategory = "Sans-serif" | "Serif" | "Monospace" | "Display";
type FilterCategory = "All Fonts" | "AI Picks" | "Current Pairing";

interface FontEntry {
  name: string;
  category: FontCategory;
  googleName: string;
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

const FILTER_CATEGORIES: FilterCategory[] = [
  "All Fonts",
  "AI Picks",
  "Current Pairing",
];
const FONT_TYPES: Array<FontCategory | "All Types"> = [
  "All Types",
  "Sans-serif",
  "Serif",
  "Monospace",
  "Display",
];

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  APPROVED_FONTS.map((font) => `family=${font.googleName}:wght@400;600;700`).join("&") +
  "&display=swap";

const SPECIMEN_HEADING = "Build Better Work, Then Show It Well";
const SPECIMEN_BODY =
  "Typography defines the pace and clarity of your portfolio. A strong heading creates structure, and the body type needs to stay effortless to read.";

function getFont(name?: string) {
  return APPROVED_FONTS.find((font) => font.name === name);
}

export function TypographyPickerPanel({
  onSubmit,
  recommendedHeadingFont,
  recommendedBodyFont,
}: TypographyPickerPanelProps) {
  const [headingFont, setHeadingFont] = useState<string>(
    recommendedHeadingFont ?? "Inter"
  );
  const [bodyFont, setBodyFont] = useState<string>(
    recommendedBodyFont ?? "Source Serif 4"
  );
  const [categoryFilter, setCategoryFilter] =
    useState<FilterCategory>("All Fonts");
  const [typeFilter, setTypeFilter] = useState<FontCategory | "All Types">(
    "All Types"
  );

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

  const aiTopChoices = APPROVED_FONTS.filter(
    (font) =>
      font.name === recommendedHeadingFont || font.name === recommendedBodyFont
  );

  const filteredFonts = APPROVED_FONTS.filter((font) => {
    if (typeFilter !== "All Types" && font.category !== typeFilter) {
      return false;
    }

    if (categoryFilter === "AI Picks") {
      return aiTopChoices.some((choice) => choice.name === font.name);
    }

    if (categoryFilter === "Current Pairing") {
      return font.name === headingFont || font.name === bodyFont;
    }

    return true;
  });

  const renderRecommendationCard = (
    label: string,
    fontName: string | undefined,
    helper: string
  ) => {
    const font = getFont(fontName);

    if (!font) {
      return null;
    }

    return (
      <article
        className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-linear-to-br from-amber-300/12 via-orange-300/10 to-transparent p-5 shadow-[0_0_40px_rgba(251,191,36,0.18)]"
        key={label}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,224,71,0.22),transparent_55%)]" />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">
            <Sparkles className="h-3.5 w-3.5" />
            AI Top Choice
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">
              {label}
            </p>
            <h3
              className="mt-2 text-2xl font-semibold text-white"
              style={{ fontFamily: `'${font.name}', sans-serif` }}
            >
              {font.name}
            </h3>
            <p className="mt-1 text-sm text-white/65">{font.category}</p>
          </div>
          <p
            className="text-sm text-white/78"
            style={{ fontFamily: `'${font.name}', sans-serif` }}
          >
            {helper}
          </p>
        </div>
      </article>
    );
  };

  const renderFontRow = (font: FontEntry) => {
    const isHeadingSelected = headingFont === font.name;
    const isBodySelected = bodyFont === font.name;
    const isRecommended =
      recommendedHeadingFont === font.name || recommendedBodyFont === font.name;

    return (
      <article
        key={font.name}
        className={`w-full rounded-2xl border px-4 py-4 transition-colors ${
          isHeadingSelected || isBodySelected
            ? "border-white/25 bg-white/[0.05]"
            : "border-white/12 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="text-xl text-white/92"
                style={{ fontFamily: `'${font.name}', sans-serif` }}
              >
                {font.name}
              </h3>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
                {font.category}
              </span>
              {isRecommended && (
                <span className="rounded-full border border-amber-300/25 bg-amber-300/12 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-100/80">
                  AI Pick
                </span>
              )}
            </div>
            <p
              className="mt-2 truncate text-sm text-white/68"
              style={{ fontFamily: `'${font.name}', sans-serif` }}
            >
              Sphinx of black quartz, judge my vow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setHeadingFont(font.name)}
              className={`h-10 rounded-xl border px-4 text-sm ${
                isHeadingSelected
                  ? "border-white/30 bg-white text-black hover:bg-white/90"
                  : "border-white/15 bg-transparent text-white hover:bg-white/[0.06]"
              }`}
            >
              {isHeadingSelected && <Check className="mr-2 h-4 w-4" />}
              Heading
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBodyFont(font.name)}
              className={`h-10 rounded-xl border px-4 text-sm ${
                isBodySelected
                  ? "border-white/30 bg-white text-black hover:bg-white/90"
                  : "border-white/15 bg-transparent text-white hover:bg-white/[0.06]"
              }`}
            >
              {isBodySelected && <Check className="mr-2 h-4 w-4" />}
              Body
            </Button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-black/70 p-6 md:p-8">
      <div className="space-y-6">
        <div className="space-y-1 border-b border-white/10 pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Typography Picker
          </p>
          <h2 className="text-xl font-semibold text-white/90 md:text-2xl">
            Choose Your Font Pairing
          </h2>
          <p className="text-sm text-white/60">
            Browse the full font list, filter it down, and assign any option to heading
            or body without expanding the panel.
          </p>
        </div>

        {aiTopChoices.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Typography Palette
                </p>
                <h3 className="text-lg font-semibold text-white/90">
                  AI&apos;s Top Choices
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {renderRecommendationCard(
                "Heading Font",
                recommendedHeadingFont,
                "Strong display energy with clear hierarchy for hero statements and section titles."
              )}
              {renderRecommendationCard(
                "Body Font",
                recommendedBodyFont,
                "Clean, readable rhythm for longer project descriptions and supporting copy."
              )}
            </div>
          </section>
        )}

        <section className="space-y-4 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                Font Library
              </p>
              <h3 className="text-lg font-semibold text-white/90">
                Browse Approved Fonts
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
                  Category
                </span>
                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value as FilterCategory)
                  }
                  className="h-11 min-w-[180px] rounded-xl border border-white/15 bg-black/40 px-3 text-sm text-white outline-none transition-colors focus:border-white/30"
                >
                  {FILTER_CATEGORIES.map((category) => (
                    <option className="bg-neutral-950" key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
                  Font Type
                </span>
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as FontCategory | "All Types")
                  }
                  className="h-11 min-w-[180px] rounded-xl border border-white/15 bg-black/40 px-3 text-sm text-white outline-none transition-colors focus:border-white/30"
                >
                  {FONT_TYPES.map((type) => (
                    <option className="bg-neutral-950" key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs text-white/45">
              <span>Showing {filteredFonts.length} fonts</span>
              <span>Scroll to browse more</span>
            </div>
            <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
              {filteredFonts.length > 0 ? (
                filteredFonts.map((font) => renderFontRow(font))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/55">
                  No fonts match the current filters.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.02] p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
              Heading: <span className="font-medium text-white/80">{headingFont}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
              Body: <span className="font-medium text-white/80">{bodyFont}</span>
            </span>
          </div>
          <h2
            className="text-3xl font-bold tracking-tight text-white/90 md:text-4xl"
            style={{ fontFamily: `'${headingFont}', sans-serif` }}
          >
            {SPECIMEN_HEADING}
          </h2>
          <p
            className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-[15px]"
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
          >
            {SPECIMEN_BODY}
          </p>
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
