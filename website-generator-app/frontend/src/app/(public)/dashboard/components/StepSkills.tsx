"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiX, FiAward } from "react-icons/fi";
import { FormState } from "@/webgenForm/formType";

interface StepSkillsProps {
  state: FormState;
  handleAddSkill: () => void;
  removeSkill: (skill: string) => void;
  skillInput: string;
  setSkillInput: React.Dispatch<React.SetStateAction<string>>;
}

const StepSkills: React.FC<StepSkillsProps> = ({
  state,
  handleAddSkill,
  removeSkill,
  skillInput,
  setSkillInput,
}) => {
  return (
    <div className="space-y-6">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <FiAward className="w-4 h-4 text-sky-500" />
          Add Your Skills
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="flex-1 bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
            placeholder="e.g., React, Python, UI Design"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddSkill}
            className="px-5 py-3 bg-linear-to-r from-sky-400 to-cyan-400 text-white rounded-lg font-semibold shadow-md shadow-sky-300/30 hover:shadow-lg hover:shadow-sky-400/40 transition-all flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Add
          </motion.button>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Press Enter or click Add to include a skill
        </p>
      </motion.div>

      {/* Skills Display */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">
            Your Skills ({state.skills.length})
          </span>
          {state.skills.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              Click × to remove
            </span>
          )}
        </div>

        {state.skills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200"
          >
            <FiAward className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium mb-1">
              No skills added yet
            </p>
            <p className="text-slate-400 text-xs">
              Start adding your expertise above!
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {state.skills.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="group relative bg-linear-to-br from-sky-50 to-cyan-50 border border-sky-200/50 px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {skill}
                  </span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="w-5 h-5 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {state.skills.length > 0 && state.skills.length < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-lg p-4"
        >
          <p className="text-xs text-sky-900 leading-relaxed">
            <span className="font-semibold">💡 Tip:</span> Add 5-10 skills for
            the best portfolio results. Include both technical skills and soft
            skills to showcase your full range of abilities!
          </p>
        </motion.div>
      )}

      {state.skills.length >= 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4"
        >
          <p className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-semibold">✨ Great job!</span> You&apos;ve added{" "}
            {state.skills.length} skills. Your portfolio will showcase a
            well-rounded skill set. Feel free to add more or move to the next
            step.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StepSkills;
