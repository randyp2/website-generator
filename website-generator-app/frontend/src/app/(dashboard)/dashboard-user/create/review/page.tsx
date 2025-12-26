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
                        <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 via-sky-800 to-cyan-700 bg-clip-text text-transparent mb-2">
                            Review Your Information
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Review the information extracted from your resume
                        </p>
                    </div>

                    {/* Edit Toggle Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${
                            isEditing
                                ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-sky-400"
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
                    className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6"
                >
                    <div className="text-center border-b border-slate-200 pb-6 mb-6">
                        {isEditing ? (
                            <input
                                type="text"
                                value={parsedResumeData?.fullName || ""}
                                onChange={(e) => updateFullName(e.target.value)}
                                className="text-4xl font-bold text-slate-900 text-center w-full bg-slate-50 px-4 py-2 rounded-lg border-2 border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/20"
                                placeholder="Your Name"
                            />
                        ) : (
                            <h2 className="text-4xl font-bold text-slate-900">
                                {parsedResumeData?.fullName || "Your Name"}
                            </h2>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Email */}
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <FiMail className="w-4 h-4 text-sky-600" />
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
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
                                    className="text-sm text-slate-900 text-center w-full bg-white px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
                                    placeholder="email@example.com"
                                />
                            ) : (
                                <p className="text-sm text-slate-900 font-medium">
                                    {parsedResumeData?.email || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <FiPhone className="w-4 h-4 text-sky-600" />
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
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
                                    className="text-sm text-slate-900 text-center w-full bg-white px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
                                    placeholder="(123) 456-7890"
                                />
                            ) : (
                                <p className="text-sm text-slate-900 font-medium">
                                    {parsedResumeData?.phone || "Not provided"}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <FiMapPin className="w-4 h-4 text-sky-600" />
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
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
                                    className="text-sm text-slate-900 text-center w-full bg-white px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
                                    placeholder="City, State"
                                />
                            ) : (
                                <p className="text-sm text-slate-900 font-medium">
                                    {parsedResumeData?.location ||
                                        "Not provided"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {(parsedResumeData?.summary || isEditing) && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                                Summary
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={parsedResumeData?.summary || ""}
                                    onChange={(e) =>
                                        updateSummary(e.target.value)
                                    }
                                    rows={3}
                                    className="w-full text-slate-700 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 resize-none"
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
                    className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-100 rounded-lg">
                                <FiCode className="w-5 h-5 text-sky-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">
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
                                            ? "bg-slate-50 border-2 border-slate-200"
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
                                                className="bg-transparent border-none focus:outline-none text-sm text-slate-900 w-32"
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
                    className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <FiBriefcase className="w-5 h-5 text-sky-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">
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
                                                className="text-xl font-bold text-slate-900 w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
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
                                                className="text-lg text-sky-600 font-semibold w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
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
                                                    className="flex-1 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
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
                                                    className="flex-1 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
                                                    placeholder="End Date"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">
                                                {exp.title}
                                            </h4>
                                            <p className="text-lg text-sky-600 font-semibold">
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
                                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
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
                                                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
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
                                                        <span className="text-sky-600 mt-1.5">
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
                                                                    className="flex-1 text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
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
                    className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <FiAward className="w-5 h-5 text-sky-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">
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
                                                className="text-xl font-bold text-slate-900 w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
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
                                                className="text-lg text-purple-600 font-semibold w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
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
                                                    className="flex-1 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
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
                                                    className="flex-1 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
                                                    placeholder="GPA (Optional)"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinue}
                    className="px-8 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-full font-bold shadow-2xl shadow-sky-400/50 flex items-center gap-3 hover:shadow-sky-400/70 transition-all"
                >
                    Continue to AI Refinement
                    <FiArrowRight className="w-5 h-5" />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default ReviewPage;
