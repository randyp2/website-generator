import React from "react";
import type { FormState } from "../../types/formTypes";
import { motion } from "framer-motion";

interface StepSkillsProps {
    state: FormState;
    handleAddSkill: () => void;
    removeSkill: (skill: string) => void;
    skillInput: string;
    setSkillInput: React.Dispatch<React.SetStateAction<string>>;
}

const StepSkills: React.FC<StepSkillsProps> = ({ state, handleAddSkill, removeSkill, skillInput, setSkillInput }) => {

    return (

        <>
            {/* Input for skills */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Add Skills
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        className="flex-1 bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="e.g., React, TypeScript"
                    />

                    {/* Add skills to formState */}
                    <button
                        onClick={handleAddSkill}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all hover:cursor-pointer"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/*  Display skills */}
            <div className="flex flex-wrap gap-2">
                {state.skills.map((skill, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-gray-700/50 px-4 py-2 rounded-full flex items-center gap-2 border border-gray-600"
                    >
                        <span>{skill}</span>
                        <button
                            onClick={() => removeSkill(skill)}
                            className="text-red-400 hover:text-red-300 transition-colors hover:cursor-pointer"
                        >
                            ×
                        </button>
                    </motion.div>
                ))}
            </div>
        </>
    );
}

export default StepSkills;