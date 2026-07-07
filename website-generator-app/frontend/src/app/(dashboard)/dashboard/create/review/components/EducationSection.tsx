"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
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
        <div className="mb-6 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-primary" />
            <GraduationCap className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold text-white">Education</h3>
        </div>

        <div className="space-y-6">
            {educations.map((edu, eduIndex) => (
                <div
                    key={`${edu.institution}-${edu.degree}-${eduIndex}`}
                    className="relative"
                >
                    {eduIndex > 0 ? (
                        <div className="mb-6 h-px w-full bg-white/10" />
                    ) : null}

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
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xl font-bold text-white focus:border-primary/50 focus:outline-none"
                                placeholder="Institution"
                            />
                            <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) =>
                                    updateEducation(eduIndex, "degree", e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-lg font-semibold text-primary/90 focus:border-primary/50 focus:outline-none"
                                placeholder="Degree"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={edu.endDate}
                                    onChange={(e) =>
                                        updateEducation(eduIndex, "endDate", e.target.value)
                                    }
                                    className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 focus:border-primary/50 focus:outline-none"
                                    placeholder="Graduation Date"
                                />
                                <input
                                    type="text"
                                    value={edu.gpa || ""}
                                    onChange={(e) =>
                                        updateEducation(eduIndex, "gpa", e.target.value)
                                    }
                                    className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 focus:border-primary/50 focus:outline-none"
                                    placeholder="GPA (Optional)"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="text-lg font-bold text-white">
                                    {edu.degree}
                                </h4>
                                <span className="text-sm font-medium text-primary">
                                    {edu.endDate}
                                </span>
                            </div>
                            <p className="text-lg font-medium text-slate-300">
                                {edu.institution}
                            </p>
                            <p className="text-sm text-slate-400">
                                {edu.gpa ? `GPA: ${edu.gpa}` : ""}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </ReviewSectionCard>
);
