"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import type { ParsedExperience } from "@/types/resume";
import { ReviewSectionCard } from "./ReviewSectionCard";

interface ExperienceSectionProps {
    experiences: ParsedExperience[];
    isEditing: boolean;
    addExperience: () => void;
    removeExperience: (index: number) => void;
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
    addExperience,
    removeExperience,
    updateExperience,
    updateExperienceBullet,
    addExperienceBullet,
    removeExperienceBullet,
}) => (
    <ReviewSectionCard className="mb-6" delay={0.3}>
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <Briefcase className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-white">Work Experience</h3>
            </div>
            {isEditing && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addExperience}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                >
                    <Plus className="w-3 h-3" />
                    Add Work Experience
                </motion.button>
            )}
        </div>

        <div className="space-y-6">
            {experiences.map((exp, expIndex) => (
                <div
                    key={`${exp.company}-${exp.title}-${expIndex}`}
                    className="relative"
                >
                    {expIndex > 0 ? (
                        <div className="mb-6 h-px w-full bg-white/10" />
                    ) : null}

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeExperience(expIndex)}
                                    className="flex items-center gap-1 text-xs font-semibold text-red-300 hover:text-red-200"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete Experience
                                </motion.button>
                            </div>
                            <input
                                type="text"
                                value={exp.title}
                                onChange={(e) =>
                                    updateExperience(expIndex, "title", e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xl font-bold text-white focus:border-primary/50 focus:outline-none"
                                placeholder="Job Title"
                            />
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) =>
                                    updateExperience(expIndex, "company", e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-lg font-semibold text-primary/90 focus:border-primary/50 focus:outline-none"
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
                                    className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 focus:border-primary/50 focus:outline-none"
                                    placeholder="Start Date"
                                />
                                <input
                                    type="text"
                                    value={exp.endDate}
                                    onChange={(e) =>
                                        updateExperience(expIndex, "endDate", e.target.value)
                                    }
                                    className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 focus:border-primary/50 focus:outline-none"
                                    placeholder="End Date"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="text-lg font-bold text-white">{exp.title}</h4>
                                <span className="text-sm font-medium text-primary">
                                    {exp.startDate} - {exp.endDate}
                                </span>
                            </div>
                            <p className="text-lg font-medium text-slate-300">
                                {exp.company}
                            </p>
                        </div>
                    )}

                    <div className="mt-4">
                        {isEditing && (
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                                    Responsibilities
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addExperienceBullet(expIndex)}
                                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add
                                </motion.button>
                            </div>
                        )}
                        <ul className="space-y-2 text-slate-300">
                            {(exp.bullets ?? []).map((bullet, bulletIndex) => (
                                <li
                                    key={`${bullet}-${bulletIndex}`}
                                    className="flex items-start gap-3"
                                >
                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-300" />
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
                                                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-200 focus:border-primary/50 focus:outline-none"
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
                                                className="rounded-xl p-2 transition-colors hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-300" />
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <span className="flex-1 leading-7">
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
