import React from "react";
import type { FormState } from "../../types/formTypes";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

interface StepStyleProps {
    state: FormState;
    updateField: (field: keyof FormState, value: string | string[]) => void;
}

const STYLES = [
    { 
      id: "apple", 
      label: "Apple Style", 
      description: "Sleek glassmorphism, white glow",
      longDescription: "Inspired by Apple’s hardware and UI aesthetic: luminous whites, translucent glass panels, and soft white accent glows. Rounded corners, ample whitespace, San-Francisco-style sans-serif fonts. Subtle glassmorphism layering, floating cards with realistic blur, and slow fade or slide animations that feel natural and weightless."
    },
    { 
      id: "neon", 
      label: "Futuristic Neon", 
      description: "Dark with bright accents and glow",
      longDescription: "High-contrast futuristic nightclub energy. Deep charcoal or near-black backgrounds with vivid cyan, magenta, and purple neon lines. Text glows softly; section borders pulse gently. Animated gradient ribbons or circuit-like dividers. Use monospace or geometric fonts and hover effects that shimmer or flicker like LED lights."
    },
    { 
      id: "zen", 
      label: "Nature Zen", 
      description: "Soft greens, calm gradients",
      longDescription: "Calm and organic. Soft gradient backgrounds in sea-green and sky-blue tones. Rounded, flowing shapes reminiscent of water and wind. Gentle opacity transitions, fade-in sections, and minimalist icons drawn with thin strokes. Balanced spacing and natural rhythm, using muted greens and creams for text."
    },
    { 
      id: "minimal", 
      label: "Minimal Light", 
      description: "White, clean, subtle shadows",
      longDescription: "Ultra-clean editorial style. White or off-white backgrounds, subtle shadows, and crisp black typography. Focus on structure and alignment: large headlines, generous spacing, precise grids. Animations are minimal and purpose-driven — fade or slide only. Fonts: Inter, Helvetica, or modern sans-serif. Use gray accents and minimal color contrast."
    },
    { 
      id: "cyberpunk", 
      label: "Cyberpunk Dark", 
      description: "Violet base, neon edges",
      longDescription: "Dystopian sci-fi energy. Base palette of deep violet, indigo, and magenta, contrasted by electric teal and hot pink accents. Use glowing borders, animated scanline textures, and subtle noise overlays. Cards appear to flicker into existence with keyframes. Bold techno fonts, angled separators, and motion-blur effects evoke speed and intensity."
    },
  ];


const CUSTOM_STYLE_CHAR_LIMIT: number = 150;

  
const StepStyle: React.FC<StepStyleProps> = ({ state, updateField }) => {

    
    return (
        <div className="space-y-8">
          {/* ===== Style Presets ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose a Style Theme
            </label>
    
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <motion.button
                  key={style.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    updateField("theme", style.id)
                    updateField("themeField", style.longDescription)
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all border 
                    state.colorPalette === style.id hover: cursor-pointer
                      ? "border-green-500 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
                      : "border-gray-700 bg-gray-800/40 hover:bg-gray-700/60"
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-white">
                        {style.label}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">{style.description}</p>
                    </div>
    
                    {state.theme === style.id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-3 h-3 rounded-full bg-green-400 mt-1"
                        />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
    
          {/* ===== Custom Style Input ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Add Custom Style Notes
            </label>
    
            <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition-all">
              <input
                type="text"
                placeholder="e.g., add blue glow, bolder text..."
                value={state.customStyle || ""}
                onChange={(e) => updateField("customStyle", e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-500"
                maxLength={CUSTOM_STYLE_CHAR_LIMIT}
              />
              <FiArrowRight className="text-green-400 text-xl" />
            </div>
            
            {/* Character Counter */}
            <div className="flex justify-between items-center mt-2">
              <p className="text-gray-500 text-sm">
                Tip: You can describe tweaks (colors, shadows, or vibe).
              </p>
              <span
                className={`text-xs font-medium ${
                  state.customStyle.length >= 150 ? "text-red-400" : (state.customStyle.length >= 100 ? "text-yellow-300" : "text-gray-400")
                }`}
              >
                {state.customStyle.length}/{150}
              </span>
            </div>
          </div>
        </div>
      );
}

export default StepStyle;