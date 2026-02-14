"use client";

import { motion } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";

interface CustomNotesSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomNotesSection: React.FC<CustomNotesSectionProps> = ({
  value,
  onChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <FiEdit3 className="w-5 h-5 text-sky-400" />
        <h3 className="text-lg font-semibold text-white">
          Additional Style Notes
        </h3>
        <span className="text-xs text-slate-400">(Optional)</span>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any specific style preferences or details you'd like to add? (e.g., 'Use ocean blue colors', 'Make it minimalistic', 'Bold typography')"
        className="w-full h-32 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:bg-white/10 transition-all resize-none"
        maxLength={500}
      />

      {/* Character Count */}
      <div className="flex justify-end">
        <span className="text-xs text-slate-400">
          {value.length} / 500 characters
        </span>
      </div>
    </motion.div>
  );
};
