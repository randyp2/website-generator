"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
            <SectionHeading icon={Code2} title="Technical Skills" />
            {isEditing && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addSkill}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                >
                    <Plus className="w-3 h-3" />
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
                    className="flex items-center gap-2"
                >
                    {isEditing ? (
                        <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-2">
                            <input
                                type="text"
                                value={skill}
                                onChange={(e) => updateSkill(index, e.target.value)}
                                className="w-32 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                                placeholder="Skill name"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeSkill(index)}
                                className="rounded-full p-1 transition-colors hover:bg-red-500/10"
                            >
                                <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-300" />
                            </motion.button>
                        </div>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="border border-primary/15 bg-primary/[0.08] px-3 py-1.5 text-sm text-primary hover:bg-primary/[0.14]"
                        >
                            {skill}
                        </Badge>
                    )}
                </motion.div>
            ))}
        </div>
    </ReviewSectionCard>
);

const SectionHeading: React.FC<{
    icon: React.ElementType;
    title: string;
}> = ({ icon, title }) => (
    <div className="flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-primary" />
        {React.createElement(icon, { className: "h-6 w-6 text-primary" })}
        <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
);
