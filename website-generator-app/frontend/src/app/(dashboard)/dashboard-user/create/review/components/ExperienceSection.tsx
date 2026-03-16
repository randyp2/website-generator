"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiBriefcase, FiPlus, FiTrash2 } from "react-icons/fi";
import type { ParsedExperience } from "@/types/resume";
import { ReviewSectionCard } from "./ReviewSectionCard";

interface ExperienceSectionProps {
    experiences: ParsedExperience[];
    isEditing: boolean;
    updateExperience: (
        index: number,
        field: keyof ParsedExperience,
        value: string,
    ) => void;
    updateExperienceBullet: (
        expIndex: number,
        bulletIndex: number,
        value: string,
    ) => void;
    addExperienceBullet: (expIndex: number) => void;
    removeExperienceBullet: (expIndex: number, bulletIndex: number) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
    experiences,
    isEditing,
    updateExperience,
    updateExperienceBullet,
    addExperienceBullet,
    removeExperienceBullet,
}) => (
    <ReviewSectionCard className="mb-6" delay={0.3}>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-sky-100 rounded-lg">
                <FiBriefcase className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Work Experience</h3>
        </div>

        <div className="space-y-6">
            {experiences.map((exp, expIndex) => (
                <div
                    key={`${exp.company}-${exp.title}-${expIndex}`}
                    className="border-l-4 border-sky-500 pl-6 pb-6 last:pb-0"
                >
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={exp.title}
                                onChange={(e) =>
                                    updateExperience(expIndex, "title", e.target.value)
                                }
                                className="text-xl font-bold text-white w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                placeholder="Job Title"
                            />
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) =>
                                    updateExperience(expIndex, "company", e.target.value)
                                }
                                className="text-lg text-sky-400 font-semibold w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                placeholder="Company Name"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={exp.startDate}
                                    onChange={(e) =>
                                        updateExperience(
                                            expIndex,
                                            "startDate",
                                            e.target.value,
                                        )
                                    }
                                    className="flex-1 text-sm text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                    placeholder="Start Date"
                                />
                                <input
                                    type="text"
                                    value={exp.endDate}
                                    onChange={(e) =>
                                        updateExperience(expIndex, "endDate", e.target.value)
                                    }
                                    className="flex-1 text-sm text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                    placeholder="End Date"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="text-xl font-bold text-white">{exp.title}</h4>
                            <p className="text-lg text-sky-400 font-semibold">
                                {exp.company}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {exp.startDate} - {exp.endDate}
                            </p>
                        </div>
                    )}

                    <div className="mt-4">
                        {isEditing && (
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    Responsibilities
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addExperienceBullet(expIndex)}
                                    className="text-xs text-sky-400 hover:text-sky-700 font-semibold flex items-center gap-1"
                                >
                                    <FiPlus className="w-3 h-3" />
                                    Add
                                </motion.button>
                            </div>
                        )}
                        <ul className="space-y-2">
                            {exp.bullets.map((bullet, bulletIndex) => (
                                <li
                                    key={`${bullet}-${bulletIndex}`}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-sky-400 mt-1.5">•</span>
                                    {isEditing ? (
                                        <div className="flex-1 flex items-start gap-2">
                                            <input
                                                type="text"
                                                value={bullet}
                                                onChange={(e) =>
                                                    updateExperienceBullet(
                                                        expIndex,
                                                        bulletIndex,
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 text-slate-700 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() =>
                                                    removeExperienceBullet(
                                                        expIndex,
                                                        bulletIndex,
                                                    )
                                                }
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 className="w-3 h-3 text-slate-500 hover:text-red-600" />
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <span className="text-slate-700 flex-1 leading-relaxed">
                                            {bullet}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    </ReviewSectionCard>
);
