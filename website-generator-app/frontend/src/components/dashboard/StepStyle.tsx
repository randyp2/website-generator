import React from "react";
import { motion } from "framer-motion";
import { FiCheck, FiEdit3,  } from "react-icons/fi";
import type { FormState } from "../../types/formTypes";

interface StepStyleProps {
  state: FormState;
  updateField: (field: keyof FormState, value: string | string[]) => void;
}

const STYLES = [
  {
    id: "apple",
    label: "Apple Style",
    description: "Sleek glassmorphism with white glow",
    colorPreview: "from-slate-100 to-white",
    accent: "sky",
    longDescription:
      "Inspired by Apple's hardware and UI aesthetic: luminous whites, translucent glass panels, and soft white accent glows. Rounded corners, ample whitespace, San-Francisco-style sans-serif fonts.",
  },
  {
    id: "neon",
    label: "Futuristic Neon",
    description: "Dark background with bright accents",
    colorPreview: "from-purple-900 to-pink-500",
    accent: "purple",
    longDescription:
      "High-contrast futuristic nightclub energy. Deep charcoal backgrounds with vivid cyan, magenta, and purple neon lines. Text glows softly with animated gradient ribbons.",
  },
  {
    id: "zen",
    label: "Nature Zen",
    description: "Soft greens and calm gradients",
    colorPreview: "from-emerald-100 to-teal-100",
    accent: "emerald",
    longDescription:
      "Calm and organic. Soft gradient backgrounds in sea-green and sky-blue tones. Rounded, flowing shapes reminiscent of water and wind with gentle opacity transitions.",
  },
  {
    id: "minimal",
    label: "Minimal Light",
    description: "Clean white with subtle shadows",
    colorPreview: "from-white to-slate-50",
    accent: "slate",
    longDescription:
      "Ultra-clean editorial style. White or off-white backgrounds, subtle shadows, and crisp black typography. Focus on structure and alignment with generous spacing.",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk Dark",
    description: "Violet base with neon edges",
    colorPreview: "from-violet-600 to-fuchsia-500",
    accent: "violet",
    longDescription:
      "Dystopian sci-fi energy. Deep violet, indigo, and magenta palette with electric teal and hot pink accents. Glowing borders and animated scanline textures.",
  },
];

const CUSTOM_STYLE_CHAR_LIMIT: number = 150;

const StepStyle: React.FC<StepStyleProps> = ({ state, updateField }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 mb-1">
          <FiPalette className="w-5 h-5 text-sky-500" />
          Choose Your Design Style
        </h3> */}
        <p className="text-sm text-slate-600">
          Select a theme that matches your personality and brand
        </p>
      </motion.div>

      {/* Style Theme Grid */}
      <div className="grid grid-cols-1 gap-3">
        {STYLES.map((style, index) => (
          <motion.button
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              updateField("theme", style.id);
              updateField("themeField", style.longDescription);
            }}
            className={`relative w-full text-left p-4 rounded-lg transition-all border-2 ${
              state.theme === style.id
                ? "border-sky-400 bg-sky-50/50 shadow-md shadow-sky-200/50"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            {/* Color Preview Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.colorPreview} rounded-t-lg`}
            />

            <div className="flex items-center justify-between mt-1">
              <div className="flex-1">
                <h4 className="text-base font-semibold text-slate-900 mb-0.5">
                  {style.label}
                </h4>
                <p className="text-sm text-slate-600 leading-snug">
                  {style.description}
                </p>
              </div>

              {/* Selection Indicator */}
              <div
                className={`flex-shrink-0 ml-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  state.theme === style.id
                    ? "bg-sky-500 text-white scale-110"
                    : "bg-slate-100 text-transparent border-2 border-slate-300"
                }`}
              >
                <FiCheck className="w-4 h-4" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Custom Style Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-2"
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiEdit3 className="w-4 h-4 text-cyan-500" />
          Custom Style Notes (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g., add blue glow, bolder text, rounded buttons..."
          value={state.customStyle || ""}
          onChange={(e) => updateField("customStyle", e.target.value)}
          maxLength={CUSTOM_STYLE_CHAR_LIMIT}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
        />

        {/* Character Counter & Tip */}
        <div className="flex justify-between items-start mt-2">
          <p className="text-xs text-slate-500 max-w-md">
            Add specific tweaks like colors, shadows, or vibe adjustments to
            personalize your theme
          </p>
          <span
            className={`text-xs font-semibold tabular-nums ${
              state.customStyle.length >= CUSTOM_STYLE_CHAR_LIMIT
                ? "text-red-500"
                : state.customStyle.length >= CUSTOM_STYLE_CHAR_LIMIT * 0.8
                ? "text-amber-500"
                : "text-slate-400"
            }`}
          >
            {state.customStyle.length}/{CUSTOM_STYLE_CHAR_LIMIT}
          </span>
        </div>
      </motion.div>

      {/* Selected Theme Info Box */}
      {state.theme && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-lg p-4"
        >
          <p className="text-xs text-sky-900 leading-relaxed">
            <span className="font-semibold">✨ Selected Theme:</span>{" "}
            {STYLES.find((s) => s.id === state.theme)?.label}
            <br />
            <span className="text-sky-800 mt-1 block">
              Your portfolio will be generated with this design aesthetic. You
              can preview and regenerate with different themes anytime!
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StepStyle;