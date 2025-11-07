"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiFileText, FiEdit, FiLayers } from "react-icons/fi";
import { FormState } from "@/webgenForm/formType";


interface StepCustomProps {
  state: FormState;
  updateField: (field: keyof FormState, value: string | string[]) => void;
}

const StepCustom: React.FC<StepCustomProps> = ({ state, updateField }) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 mb-1">
          <FiLayers className="w-5 h-5 text-sky-500" />
          Add a Custom Section
        </h3>
        <p className="text-sm text-slate-600">
          Optional: Include projects, testimonials, or any unique content
        </p>
      </motion.div>

      {/* Custom Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiFileText className="w-4 h-4 text-sky-500" />
          Section Title
        </label>
        <input
          type="text"
          value={state.customSectionTitle}
          onChange={(e) => updateField("customSectionTitle", e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
          placeholder="e.g., Featured Projects, Testimonials, Awards"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Give your custom section a descriptive heading
        </p>
      </motion.div>

      {/* Custom Section Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiEdit className="w-4 h-4 text-cyan-500" />
          Section Content
        </label>
        <textarea
          value={state.customSectionContent}
          onChange={(e) =>
            updateField("customSectionContent", e.target.value)
          }
          rows={8}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all resize-none"
          placeholder="Add project descriptions, client testimonials, awards, or any other content you want to showcase..."
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Write the content that will appear in this section. Be descriptive
          and specific!
        </p>
      </motion.div>

      {/* Examples Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-50 border border-slate-200 rounded-lg p-5"
      >
        <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span>
          Section Ideas
        </h4>
        <ul className="space-y-2.5 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-sky-500 mt-0.5 shrink-0">•</span>
            <span>
              <strong className="text-slate-800">Featured Projects:</strong> Highlight 2-3 key projects
              with descriptions and links
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
            <span>
              <strong className="text-slate-800">Client Testimonials:</strong> Add quotes from satisfied
              clients or colleagues
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-500 mt-0.5 shrink-0">•</span>
            <span>
              <strong className="text-slate-800">Awards & Recognition:</strong> Showcase achievements,
              certifications, or accolades
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
            <span>
              <strong className="text-slate-800">Blog or Writing:</strong> Link to articles or thought
              leadership content
            </span>
          </li>
        </ul>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-linear-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-lg p-4"
      >
        <p className="text-xs text-sky-900 leading-relaxed">
          <span className="font-semibold">ℹ️ Note:</span> This section is
          completely optional. If you leave it blank, your portfolio will still
          look great with the core sections: About, Skills, and Contact.
        </p>
      </motion.div>
    </div>
  );
};

export default StepCustom;