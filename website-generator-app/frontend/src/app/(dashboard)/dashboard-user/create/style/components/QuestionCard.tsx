"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { StylePreferences } from "@/types/style";

interface QuestionCardProps {
  question: string;
  description: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  questionKey: keyof StylePreferences;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  description,
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">{question}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = selectedValue === option;

          return (
            <motion.button
              key={option}
              onClick={() => onSelect(option)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/20"
                  : "border-white/10 bg-white/5 hover:border-sky-400/50 hover:bg-white/10"
              }`}
            >
              {/* Selected Indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <FiCheck className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Option Text */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-sky-500 bg-sky-500"
                      : "border-white/30"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    isSelected ? "text-white" : "text-slate-300"
                  }`}
                >
                  {option}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
