"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiCode, FiPlus, FiTrash2 } from "react-icons/fi";
import { ReviewSectionCard } from "./ReviewSectionCard";

interface SkillsSectionProps {
    isEditing: boolean;
    skills: string[];
    addSkill: () => void;
    updateSkill: (index: number, value: string) => void;
    removeSkill: (index: number) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
    isEditing,
    skills,
    addSkill,
    updateSkill,
    removeSkill,
}) => (
    <ReviewSectionCard className="mb-6" delay={0.2}>
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-lg">
                    <FiCode className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Skills</h3>
            </div>
            {isEditing && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addSkill}
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                    <FiPlus className="w-4 h-4" />
                    Add Skill
                </motion.button>
            )}
        </div>

        <div className="flex flex-wrap gap-3">
            {skills.map((skill, index) => (
                <motion.div
                    key={`${skill}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        isEditing
                            ? "bg-white/5 border-2 border-white/10"
                            : "bg-linear-to-r from-sky-50 to-cyan-50 border border-sky-200"
                    }`}
                >
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={skill}
                                onChange={(e) => updateSkill(index, e.target.value)}
                                className="bg-transparent border-none focus:outline-none text-sm text-white w-32"
                                placeholder="Skill name"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeSkill(index)}
                                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                            >
                                <FiTrash2 className="w-3 h-3 text-slate-500 hover:text-red-600" />
                            </motion.button>
                        </>
                    ) : (
                        <span className="text-sm font-medium text-sky-900">{skill}</span>
                    )}
                </motion.div>
            ))}
        </div>
    </ReviewSectionCard>
);
