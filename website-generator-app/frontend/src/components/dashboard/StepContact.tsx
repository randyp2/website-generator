"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiMail, FiGithub, FiLinkedin } from "react-icons/fi";
import { FormState } from "@/webgenForm/formType";


interface StepContactProps {
  state: FormState;
  updateField: (field: keyof FormState, value: string | string[]) => void;
}

const StepContact: React.FC<StepContactProps> = ({ state, updateField }) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Contact Information
        </h3>
        <p className="text-sm text-slate-600">
          Add ways for visitors to reach you or view your work
        </p>
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiMail className="w-4 h-4 text-sky-500" />
          Email Address
        </label>
        <input
          type="email"
          value={state.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
          placeholder="john.doe@example.com"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Professional email where clients or recruiters can reach you
        </p>
      </motion.div>

      {/* GitHub */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiGithub className="w-4 h-4 text-slate-700" />
          GitHub Profile
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            github.com/
          </span>
          <input
            type="text"
            value={state.github}
            onChange={(e) => updateField("github", e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-lg pl-[110px] pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
            placeholder="yourusername"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Showcase your code and open-source contributions
        </p>
      </motion.div>

      {/* LinkedIn */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiLinkedin className="w-4 h-4 text-blue-600" />
          LinkedIn Profile
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            linkedin.com/in/
          </span>
          <input
            type="text"
            value={state.linkedin}
            onChange={(e) => updateField("linkedin", e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-lg pl-[135px] pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
            placeholder="yourusername"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Connect professionally and display your career history
        </p>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-linear-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-lg p-4 mt-6"
      >
        <p className="text-xs text-sky-900 leading-relaxed">
          <span className="font-semibold">🔒 Privacy Note:</span> All contact
          fields are optional. Only add information you're comfortable sharing
          publicly on your portfolio.
        </p>
      </motion.div>
    </div>
  );
};

export default StepContact;