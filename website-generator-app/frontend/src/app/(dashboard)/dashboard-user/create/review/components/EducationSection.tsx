"use client";

import React from "react";
import { FiAward } from "react-icons/fi";
import type { ParsedEducation } from "@/types/resume";
import { ReviewSectionCard } from "./ReviewSectionCard";

interface EducationSectionProps {
    educations: ParsedEducation[];
    isEditing: boolean;
    updateEducation: (
        index: number,
        field: keyof ParsedEducation,
        value: string,
    ) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
    educations,
    isEditing,
    updateEducation,
}) => (
    <ReviewSectionCard className="mb-6" delay={0.4}>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-sky-100 rounded-lg">
                <FiAward className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Education</h3>
        </div>

        <div className="space-y-6">
            {educations.map((edu, eduIndex) => (
                <div
                    key={`${edu.institution}-${edu.degree}-${eduIndex}`}
                    className="border-l-4 border-purple-500 pl-6"
                >
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) =>
                                    updateEducation(
                                        eduIndex,
                                        "institution",
                                        e.target.value,
                                    )
                                }
                                className="text-xl font-bold text-white w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                placeholder="Institution"
                            />
                            <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) =>
                                    updateEducation(eduIndex, "degree", e.target.value)
                                }
                                className="text-lg text-purple-600 font-semibold w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                placeholder="Degree"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={edu.endDate}
                                    onChange={(e) =>
                                        updateEducation(eduIndex, "endDate", e.target.value)
                                    }
                                    className="flex-1 text-sm text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                    placeholder="Graduation Date"
                                />
                                <input
                                    type="text"
                                    value={edu.gpa || ""}
                                    onChange={(e) =>
                                        updateEducation(eduIndex, "gpa", e.target.value)
                                    }
                                    className="flex-1 text-sm text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                    placeholder="GPA (Optional)"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="text-xl font-bold text-white">
                                {edu.institution}
                            </h4>
                            <p className="text-lg text-purple-600 font-semibold">
                                {edu.degree}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                Graduated: {edu.endDate}
                                {edu.gpa ? ` • GPA: ${edu.gpa}` : ""}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </ReviewSectionCard>
);
