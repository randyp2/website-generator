"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    FiArrowRight,
    FiEdit3,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiCode,
    FiAward,
    FiTrash2,
    FiPlus,
    FiSave,
} from "react-icons/fi";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { ParsedExperience, ParsedEducation } from "@/types/resume";

const ReviewPage: React.FC = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    // Get all state and update functions from Zustand store
    const {
        templateId,
        portfolioId,
        parsedResumeData,
        updateFullName,
        updateEmail,
        updatePhone,
        updateLocation,
        updateSummary,
        addSkill,
        updateSkill,
        removeSkill,
        updateExperience,
        updateExperienceBullet,
        addExperienceBullet,
        removeExperienceBullet,
        updateEducation,
    } = usePortfolioStore();

    const handleContinue = async () => {
        if (!parsedResumeData || !portfolioId) {
            alert("Missing resume data");
            return;
        }

        // Save parsed resume data to backend before continuing
        try {
            const res: Response = await fetch(
                `/api/portfolio/${portfolioId}/resume`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        parsedJson: parsedResumeData,
                        extractedText: parsedResumeData.normalizedText,
                    }),
                },
            );

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Failed to save resume data:", errorData);
                throw new Error(errorData.error || "Failed to save resume data");
            }

            router.push(
                `/dashboard-user/create/refine?templateId=${templateId}`,
            );
        } catch (error) {
            console.error("Error saving resume data:", error);
            alert("Failed to save resume data. Please try again.");
            return;
        }
    };

    return (
        <div className="relative min-h-screen p-10 pb-32">
            {/* Header with Edit Toggle */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Review Your Information
                        </h1>
                        <p className="text-slate-300 text-lg">
                            Review and edit the information extracted from your resume
                        </p>
                    </div>

                    {/* Edit Toggle Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${
                            isEditing
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                : "bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white hover:bg-white/20"
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <FiSave className="w-5 h-5" />
                                Save & Done
                            </>
                        ) : (
                            <>
                                <FiEdit3 className="w-5 h-5" />
                                Edit
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Main Content - Centered Resume Display */}
            <div className="max-w-5xl mx-auto">
                {/* Personal Information Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-6"
                >
                    <div className="text-center border-b border-white/10 pb-6 mb-6">
                        {isEditing ? (
                            <input
                                type="text"
                                value={parsedResumeData?.fullName || ""}
                                onChange={(e) => updateFullName(e.target.value)}
                                className="text-4xl font-bold text-white text-center w-full bg-white/5 px-4 py-2 rounded-lg border-2 border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/20"
                                placeholder="Your Name"
                            />
                        ) : (
                            <h2 className="text-4xl font-bold text-white">
                                {parsedResumeData?.fullName || "Your Name"}
                            </h2>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Email */}
                        <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <FiMail className="w-4 h-4 text-sky-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    Email
                                </span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={parsedResumeData?.email || ""}
                                    onChange={(e) =>
                                        updateEmail(e.target.value)
                                    }
                                    className="text-sm text-white text-center w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                    placeholder="email@example.com"
                                />
                            ) : (
                                <p className="text-sm text-white font-medium">
                                    {parsedResumeData?.email || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <FiPhone className="w-4 h-4 text-sky-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    Phone
                                </span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={parsedResumeData?.phone || ""}
                                    onChange={(e) =>
                                        updatePhone(e.target.value)
                                    }
                                    className="text-sm text-white text-center w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                    placeholder="(123) 456-7890"
                                />
                            ) : (
                                <p className="text-sm text-white font-medium">
                                    {parsedResumeData?.phone || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <FiMapPin className="w-4 h-4 text-sky-400" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    Location
                                </span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={parsedResumeData?.location || ""}
                                    onChange={(e) =>
                                        updateLocation(e.target.value)
                                    }
                                    className="text-sm text-white text-center w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                    placeholder="City, State"
                                />
                            ) : (
                                <p className="text-sm text-white font-medium">
                                    {parsedResumeData?.location ||
                                        "Not provided"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {(parsedResumeData?.summary || isEditing) && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                                Summary
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={parsedResumeData?.summary || ""}
                                    onChange={(e) =>
                                        updateSummary(e.target.value)
                                    }
                                    rows={3}
                                    className="w-full text-slate-700 bg-white/5 px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400 resize-none"
                                    placeholder="Professional summary..."
                                />
                            ) : (
                                <p className="text-slate-700 leading-relaxed">
                                    {parsedResumeData?.summary ||
                                        "No summary provided"}
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Skills Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-100 rounded-lg">
                                <FiCode className="w-5 h-5 text-sky-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                Skills
                            </h3>
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
                        {(parsedResumeData?.skills || []).map(
                            (skill: string, index: number) => (
                                <motion.div
                                    key={index}
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
                                                onChange={(e) =>
                                                    updateSkill(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                className="bg-transparent border-none focus:outline-none text-sm text-white w-32"
                                                placeholder="Skill name"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() =>
                                                    removeSkill(index)
                                                }
                                                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                            >
                                                <FiTrash2 className="w-3 h-3 text-slate-500 hover:text-red-600" />
                                            </motion.button>
                                        </>
                                    ) : (
                                        <span className="text-sm font-medium text-sky-900">
                                            {skill}
                                        </span>
                                    )}
                                </motion.div>
                            ),
                        )}
                    </div>
                </motion.div>

                {/* Experience Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <FiBriefcase className="w-5 h-5 text-sky-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                            Work Experience
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {(parsedResumeData?.experiences || []).map(
                            (exp: ParsedExperience, expIndex: number) => (
                                <div
                                    key={expIndex}
                                    className="border-l-4 border-sky-500 pl-6 pb-6 last:pb-0"
                                >
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={exp.title}
                                                onChange={(e) =>
                                                    updateExperience(
                                                        expIndex,
                                                        "title",
                                                        e.target.value,
                                                    )
                                                }
                                                className="text-xl font-bold text-white w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                                placeholder="Job Title"
                                            />
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) =>
                                                    updateExperience(
                                                        expIndex,
                                                        "company",
                                                        e.target.value,
                                                    )
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
                                                        updateExperience(
                                                            expIndex,
                                                            "endDate",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 text-sm text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                                    placeholder="End Date"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="text-xl font-bold text-white">
                                                {exp.title}
                                            </h4>
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
                                                    onClick={() =>
                                                        addExperienceBullet(
                                                            expIndex,
                                                        )
                                                    }
                                                    className="text-xs text-sky-400 hover:text-sky-700 font-semibold flex items-center gap-1"
                                                >
                                                    <FiPlus className="w-3 h-3" />
                                                    Add
                                                </motion.button>
                                            </div>
                                        )}
                                        <ul className="space-y-2">
                                            {exp.bullets.map(
                                                (
                                                    bullet: string,
                                                    bulletIndex: number,
                                                ) => (
                                                    <li
                                                        key={bulletIndex}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <span className="text-sky-400 mt-1.5">
                                                            •
                                                        </span>
                                                        {isEditing ? (
                                                            <div className="flex-1 flex items-start gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        bullet
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateExperienceBullet(
                                                                            expIndex,
                                                                            bulletIndex,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="flex-1 text-slate-700 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                                                />
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.1,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.9,
                                                                    }}
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
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </motion.div>

                {/* Education Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <FiAward className="w-5 h-5 text-sky-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                            Education
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {(parsedResumeData?.educations || []).map(
                            (edu: ParsedEducation, eduIndex: number) => (
                                <div
                                    key={eduIndex}
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
                                                    updateEducation(
                                                        eduIndex,
                                                        "degree",
                                                        e.target.value,
                                                    )
                                                }
                                                className="text-lg text-purple-600 font-semibold w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                                placeholder="Degree"
                                            />
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={edu.endDate}
                                                    onChange={(e) =>
                                                        updateEducation(
                                                            eduIndex,
                                                            "endDate",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 text-sm text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                                                    placeholder="Graduation Date"
                                                />
                                                <input
                                                    type="text"
                                                    value={edu.gpa || ""}
                                                    onChange={(e) =>
                                                        updateEducation(
                                                            eduIndex,
                                                            "gpa",
                                                            e.target.value,
                                                        )
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
                                                {edu.gpa &&
                                                    ` • GPA: ${edu.gpa}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Continue Button */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 0 40px rgba(255, 255, 255, 0.25)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={handleContinue}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3"
            >
                Continue to AI Refinement
                <FiArrowRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
};

export default ReviewPage;
