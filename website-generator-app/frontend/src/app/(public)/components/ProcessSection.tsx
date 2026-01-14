"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutTemplate, Palette, Upload, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
    number: string;
    title: string;
    description: string;
    accentColor: "cyan" | "purple";
    icon: LucideIcon;
}

const steps: Step[] = [
    {
        number: "01",
        title: "Pick Template",
        description:
            "Browse our curated collection of professional templates designed for your field and style.",
        accentColor: "cyan",
        icon: LayoutTemplate,
    },
    {
        number: "02",
        title: "Customize Style",
        description:
            "Adjust colors, fonts, and layouts with intuitive controls. Make it uniquely yours.",
        accentColor: "purple",
        icon: Palette,
    },
    {
        number: "03",
        title: "Upload & Personalize",
        description:
            "Upload your resume and documents. AI extracts and organizes your information instantly.",
        accentColor: "cyan",
        icon: Upload,
    },
    {
        number: "04",
        title: "Generate & Refine",
        description:
            "AI generates your portfolio. Continue refining with AI assistance until it's perfect.",
        accentColor: "purple",
        icon: Sparkles,
    },
];

export const ProcessSection: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section className="relative py-20 px-6 bg-[#26282a] text-white overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    {/* Title Badge */}
                    <div className="inline-flex items-center justify-center mb-6">
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
                            How it works
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        The simplest way to build your portfolio
                    </h2>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        Get started and launch your portfolio in 4 easy steps
                    </p>
                </div>

                {/* Main Container with Cards and Preview */}
                <div className="max-w-6xl mx-auto bg-neutral-900/30 border border-neutral-700/40 rounded-2xl p-8 md:p-12">
                    {/* Horizontal Steps Row - No card containers */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
                        {steps.map((step, index) => {
                            const isActive = activeStep === index;
                            const Icon = step.icon;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                    viewport={{ once: true }}
                                    onClick={() => setActiveStep(index)}
                                    className="cursor-pointer group"
                                >
                                    {/* Icon */}
                                    <div className="mb-4 flex justify-start">
                                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                    </div>

                                    {/* Title with underline for active state */}
                                    <h3
                                        className={`text-lg md:text-xl font-semibold mb-2 transition-all duration-300 ${
                                            isActive
                                                ? "text-white"
                                                : "text-neutral-400 group-hover:text-neutral-300"
                                        }`}
                                    >
                                        {step.title}
                                    </h3>

                                    {/* Active indicator underline */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            width: isActive ? "100%" : "0%",
                                            opacity: isActive ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className={`h-0.5 ${
                                            step.accentColor === "cyan"
                                                ? "bg-cyan-400"
                                                : "bg-purple-400"
                                        } rounded-full`}
                                    />

                                    {/* Description */}
                                    <p
                                        className={`hidden md:block text-sm leading-relaxed mt-3 transition-colors duration-300 ${
                                            isActive
                                                ? "text-neutral-300"
                                                : "text-neutral-500 group-hover:text-neutral-400"
                                        }`}
                                    >
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Preview Section Below Cards */}
                    <div className="relative bg-neutral-900/50 border border-neutral-700/50 rounded-xl overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="aspect-video flex flex-col items-center justify-center p-8"
                            >
                                {/* Placeholder for images - using colored backgrounds for now */}
                                <div
                                    className={`w-full h-full flex flex-col items-center justify-center text-2xl font-semibold rounded-lg ${
                                        steps[activeStep].accentColor === "cyan"
                                            ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 text-cyan-300"
                                            : "bg-gradient-to-br from-purple-900/20 to-pink-900/20 text-purple-300"
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl md:text-4xl mb-4">
                                            {steps[activeStep].title}
                                        </div>
                                        <div className="text-base md:text-lg text-neutral-300 max-w-xl">
                                            {steps[activeStep].description}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};
