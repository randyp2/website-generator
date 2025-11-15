"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    FiZap,
    FiArrowRight,
    FiCheck,
    FiStar,
    FiCode,
    FiHeart,
    FiTrendingUp,
    FiBookOpen,
    FiUser,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";

/**
 * MODULE 3: CREATE PORTFOLIO FLOW - STEP 1: TEMPLATE GALLERY
 * 
 * Design Goals:
 * - Visual browsing experience (thumbnails over text)
 * - Hover preview shows template personality
 * - Clear categorization and popular indicators
 * - "Blank canvas" option doesn't feel like a fallback
 * - Smooth transition to AI refinement step
 */

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    gradient: string;
    pattern: string;
    popular?: boolean;
    icon: IconType;
    tags: string[];
}

const TemplateGallery: React.FC = () => {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

    const templates: Template[] = [
        {
            id: "minimal-tech",
            name: "Minimal Tech",
            description: "Clean, professional, and code-focused. Perfect for developers.",
            category: "Professional",
            gradient: "from-slate-900 via-slate-800 to-slate-700",
            pattern: "circuit",
            popular: true,
            icon: FiCode,
            tags: ["Developer", "Minimal", "Dark"],
        },
        {
            id: "creative-gradient",
            name: "Creative Gradient",
            description: "Vibrant and expressive. Ideal for designers and creatives.",
            category: "Creative",
            gradient: "from-violet-500 via-purple-500 to-pink-500",
            pattern: "mesh",
            popular: true,
            icon: FiHeart,
            tags: ["Designer", "Colorful", "Modern"],
        },
        {
            id: "neon-dystopian",
            name: "Neon Dystopian",
            description: "Bold, edgy, futuristic. Stand out from the crowd.",
            category: "Unique",
            gradient: "from-cyan-500 via-blue-600 to-purple-700",
            pattern: "grid",
            icon: FiZap,
            tags: ["Bold", "Futuristic", "Eye-catching"],
        },
        {
            id: "academic-elegant",
            name: "Academic Elegant",
            description: "Sophisticated and scholarly. Perfect for researchers.",
            category: "Professional",
            gradient: "from-amber-700 via-orange-800 to-red-900",
            pattern: "paper",
            icon: FiBookOpen,
            tags: ["Academic", "Professional", "Classic"],
        },
        {
            id: "personal-storytelling",
            name: "Personal Storytelling",
            description: "Warm and inviting. Let your personality shine through.",
            category: "Personal",
            gradient: "from-emerald-400 via-teal-500 to-cyan-600",
            pattern: "organic",
            popular: true,
            icon: FiUser,
            tags: ["Personal", "Friendly", "Approachable"],
        },
    ];

    const getPatternSVG = (pattern: string) => {
        const patterns: Record<string, string> = {
            circuit:
                "M0 0h20v20H0z M10 10h10v10H10z M0 10h10v10H0z M10 0h10v10H10z",
            mesh: "M0 0h20L10 10 0 20z M20 0L10 10 20 20z M10 10L0 20h20z",
            grid: "M0 10h20 M10 0v20",
            paper: "M0 0h20v20H0z M2 2h16v16H2z",
            organic: "M0 10Q5 5 10 10t10 0 M0 20Q5 15 10 20t10 0",
        };
        return patterns[pattern] || patterns.circuit;
    };

    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 font-semibold text-sm mb-4">
                    Step 1 of 2
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                    Choose Your Starting Point
                </h1>
                <p className="text-lg text-slate-600">
                    Pick a template that matches your style, or start from scratch.
                    Don't worry—everything is customizable!
                </p>
            </motion.div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Blank Canvas Option */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, y: -8 }}
                    onClick={() => handleSelectTemplate("blank")}
                    className="relative group cursor-pointer"
                >
                    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 ${selectedTemplate === "blank"
                            ? "border-sky-400 shadow-xl shadow-sky-400/30"
                            : "border-dashed border-slate-300 hover:border-sky-400"
                        } shadow-lg hover:shadow-2xl transition-all h-full`}>
                        {/* Selected Indicator */}
                        <AnimatePresence>
                            {selectedTemplate === "blank" && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-linear-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <FiCheck className="w-5 h-5 text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Blank Canvas Visual */}
                        <div className="relative h-56 bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                            <motion.div
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                                className="w-16 h-16 border-4 border-slate-300 rounded-xl flex items-center justify-center"
                            >
                                <FiZap className="w-8 h-8 text-slate-400" />
                            </motion.div>

                            {/* Floating Elements */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -10, 0],
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{
                                        duration: 2 + i,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                    }}
                                    className="absolute w-3 h-3 bg-sky-300 rounded-full"
                                    style={{
                                        top: `${30 + i * 20}%`,
                                        left: `${20 + i * 30}%`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-linear-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                                    <FiZap className="w-4 h-4 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Start from Blank
                                </h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">
                                Build your unique portfolio from scratch with AI assistance
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                    Full Control
                                </span>
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                    AI-Powered
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Template Cards */}
                {templates.map((template, index) => {
                    const Icon = template.icon;

                    return (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (index + 1) * 0.1 }}
                            whileHover={{ scale: 1.02, y: -8 }}
                            onHoverStart={() => setHoveredTemplate(template.id)}
                            onHoverEnd={() => setHoveredTemplate(null)}
                            onClick={() => handleSelectTemplate(template.id)}
                            className="relative group cursor-pointer"
                        >
                            {/* Selected Indicator */}
                            <AnimatePresence>
                                {selectedTemplate === template.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-linear-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <FiCheck className="w-5 h-5 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Popular Badge */}
                            {template.popular && (
                                <div className="absolute top-4 left-4 z-10">
                                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 backdrop-blur-sm rounded-full text-xs font-bold text-amber-700">
                                        <FiStar className="w-3 h-3" />
                                        Popular
                                    </div>
                                </div>
                            )}

                            <div className={`bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border ${selectedTemplate === template.id
                                    ? "border-sky-400 shadow-xl shadow-sky-400/30"
                                    : "border-white/40"
                                } shadow-lg hover:shadow-2xl transition-all h-full`}>
                                {/* Template Preview */}
                                <div className="relative h-56 overflow-hidden">
                                    <div className={`absolute inset-0 bg-linear-to-br ${template.gradient}`}>
                                        {/* Pattern Overlay */}
                                        <svg
                                            className="absolute inset-0 w-full h-full opacity-20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <defs>
                                                <pattern
                                                    id={`pattern-${template.id}`}
                                                    x="0"
                                                    y="0"
                                                    width="20"
                                                    height="20"
                                                    patternUnits="userSpaceOnUse"
                                                >
                                                    <path
                                                        d={getPatternSVG(template.pattern)}
                                                        fill="none"
                                                        stroke="white"
                                                        strokeWidth="1"
                                                    />
                                                </pattern>
                                            </defs>
                                            <rect
                                                width="100%"
                                                height="100%"
                                                fill={`url(#pattern-${template.id})`}
                                            />
                                        </svg>
                                    </div>

                                    {/* Hover Overlay */}
                                    <AnimatePresence>
                                        {hoveredTemplate === template.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1, type: "spring" }}
                                                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3"
                                                >
                                                    <Icon className="w-6 h-6" /> 
                                                </motion.div>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="text-sm text-center"
                                                >
                                                    {template.description}
                                                </motion.p>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="mt-4 px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold text-sm flex items-center gap-2"
                                                >
                                                    Select Template
                                                    <FiArrowRight className="w-4 h-4" />
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-8 h-8 bg-linear-to-br ${template.gradient} rounded-lg flex items-center justify-center text-white`}>
                                        <Icon className="w-4 h-4" /> 
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {template.name}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">
                                        {template.category}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {template.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Continue Button (appears after selection) */}
            <AnimatePresence>
                {selectedTemplate && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            
                            onClick={() => router.push(`/dashboard-user/create/refine?templateId=${selectedTemplate}`)}
                            className="px-8 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-full font-bold shadow-2xl shadow-sky-400/50 flex items-center gap-3"
                        >
                            Continue to AI Refinement
                            <FiArrowRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TemplateGallery;
