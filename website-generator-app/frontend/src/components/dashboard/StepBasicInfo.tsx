import React from "react";
import { motion } from "framer-motion";
import { FiUser, FiBriefcase, FiFileText } from "react-icons/fi";
import { FormState } from "@/webgenForm/formType";



interface StepBasicInfoProps {
  state: FormState;
  updateField: (field: keyof FormState, value: string | string[]) => void;
}

const ABOUT_YOU_CHAR_LIMIT: number = 500;

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  state,
  updateField,
}) => {
  return (
    <div className="space-y-6">
      {/* Full Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiUser className="w-4 h-4 text-sky-500" />
          Full Name
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
          placeholder="John Doe"
        />
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiBriefcase className="w-4 h-4 text-cyan-500" />
          Professional Tagline
        </label>
        <input
          type="text"
          value={state.tagline}
          onChange={(e) => updateField("tagline", e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
          placeholder="Full-Stack Developer & Creative Designer"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          A brief description that appears in your hero section
        </p>
      </motion.div>

      {/* About You */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiFileText className="w-4 h-4 text-sky-500" />
          About You
        </label>
        <textarea
          value={state.about}
          onChange={(e) => updateField("about", e.target.value)}
          rows={5}
          maxLength={ABOUT_YOU_CHAR_LIMIT}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all resize-none"
          placeholder="Share your story, passions, and what makes you unique..."
        />

        {/* Character Counter */}
        <div className="flex justify-between items-start mt-2">
          <p className="text-xs text-slate-500 max-w-md">
            💡 Describe your background, skills, and aspirations to help AI create
            a more personalized portfolio
          </p>
          <span
            className={`text-xs font-semibold tabular-nums ${
              state.about.length >= ABOUT_YOU_CHAR_LIMIT
                ? "text-red-500"
                : state.about.length >= ABOUT_YOU_CHAR_LIMIT * 0.8
                ? "text-amber-500"
                : "text-slate-400"
            }`}
          >
            {state.about.length}/{ABOUT_YOU_CHAR_LIMIT}
          </span>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-linear-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-lg p-4"
      >
        <p className="text-xs text-sky-900 leading-relaxed">
          <span className="font-semibold">✨ Pro Tip:</span> The more detail you
          provide, the more personalized your portfolio will be. Think of this as
          your first impression—make it count!
        </p>
      </motion.div>
    </div>
  );
};

export default StepBasicInfo;