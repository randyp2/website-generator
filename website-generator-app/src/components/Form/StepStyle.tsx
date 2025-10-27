import React from "react";
import type { FormState } from "../../types/formTypes";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

interface StepStyleProps {
    state: FormState;
    updateField: (field: keyof FormState, value: string | string[]) => void;
}

const STYLES = [
    { id: "apple", label: "Apple Style", description: "Sleek glassmorphism, green glow" },
    { id: "neon", label: "Futuristic Neon", description: "Dark with bright accents and glow" },
    { id: "zen", label: "Nature Zen", description: "Soft greens, calm gradients" },
    { id: "minimal", label: "Minimal Light", description: "White, clean, subtle shadows" },
    { id: "cyberpunk", label: "Cyberpunk Dark", description: "Violet base, neon edges" },
  ];

  
const StepStyle: React.FC<StepStyleProps> = ({ state, updateField }) => {

    // return (
    //     <>
    //         {/* <div>
    //             <label className="block text-sm font-medium text-gray-300 mb-2">
    //                 Color Palette
    //             </label>
    //             <div className="grid grid-cols-3 gap-3">
    //                 {['green', 'blue', 'purple'].map((color) => (
    //                     <button
    //                         key={color}
    //                         onClick={() => updateField('colorPalette', color)}
    //                         className={`py-3 rounded-xl font-semibold transition-all ${state.colorPalette === color
    //                                 ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg'
    //                                 : 'bg-gray-700 hover:bg-gray-600'
    //                             }`}
    //                     >
    //                         {color.charAt(0).toUpperCase() + color.slice(1)}
    //                     </button>
    //                 ))}
    //             </div>
    //         </div>
    //         <div>
    //             <label className="block text-sm font-medium text-gray-300 mb-2">
    //                 Theme
    //             </label>
    //             <div className="grid grid-cols-2 gap-3">
    //                 {['dark', 'light'].map((theme) => (
    //                     <button
    //                         key={theme}
    //                         onClick={() => updateField('theme', theme)}
    //                         className={`py-3 rounded-xl font-semibold transition-all ${state.theme === theme
    //                                 ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg'
    //                                 : 'bg-gray-700 hover:bg-gray-600'
    //                             }`}
    //                     >
    //                         {theme.charAt(0).toUpperCase() + theme.slice(1)}
    //                     </button>
    //                 ))}
    //             </div>
    //         </div> */}

            
    //     </>
    // );

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
                  onClick={() => updateField("theme", style.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all border 
                    state.colorPalette === style.id
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
              />
              <FiArrowRight className="text-green-400 text-xl" />
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Tip: You can describe tweaks (colors, shadows, or vibe). The AI will use these in future generations.
            </p>
          </div>
        </div>
      );
}

export default StepStyle;