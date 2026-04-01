"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Rocket, ChevronDown } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const features = [
    {
        icon: Upload,
        title: "Upload Resume",
        shortDescription:
            "Start with your existing resume. Our AI extracts everything you need instantly.",
        spotlightColor: "rgba(255, 255, 255, 0.15)",
        iconBg: "bg-neutral-800/40",
        iconBorder: "border-neutral-700/50",
        iconColor: "text-white",
        details: [
            "Upload your resume in PDF or DOCX format",
            "AI automatically extracts work experience, education, and skills",
            "Review and edit extracted information in real-time",
            "Add additional sections or custom content as needed",
        ],
    },
    {
        icon: Sparkles,
        title: "Prompt AI & Customize",
        shortDescription:
            "Describe your vision and let AI generate stunning portfolio designs tailored to you.",
        spotlightColor: "rgba(99, 221, 255, 0.25)",
        iconBg: "bg-cyan-900/20",
        iconBorder: "border-cyan-800/50",
        iconColor: "text-cyan-400",
        details: [
            "Describe your ideal portfolio style to our AI",
            "AI generates multiple design options based on your field",
            "Customize colors, fonts, and layouts with intuitive controls",
            "Preview changes instantly across all devices",
        ],
    },
    {
        icon: Rocket,
        title: "Deploy Website",
        shortDescription:
            "Go live in minutes. Download your code or deploy directly to the web with one click.",
        spotlightColor: "rgba(168, 85, 247, 0.25)",
        iconBg: "bg-purple-900/20",
        iconBorder: "border-purple-800/50",
        iconColor: "text-purple-400",
        details: [
            "Download complete source code ready for customization",
            "One-click deploy to Vercel, Netlify, or GitHub Pages",
            "Connect your custom domain with simple DNS setup",
            "Automatic HTTPS and global CDN included",
        ],
    },
];

export const FeatureSection: React.FC = () => {
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    const toggleCard = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setExpandedCard(expandedCard === index ? null : index);
    };

    return (
        <section className="relative pt-4 pb-24 px-6 bg-black text-white overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-[0_12px_34px_rgba(0,200,255,0.18)]">
                        How It Works
                    </h2>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        From resume to live portfolio in three simple steps. Click
                        each card to learn more.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-7xl mx-auto items-start">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const isExpanded = expandedCard === index;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <SpotlightCard
                                    className="p-8 h-full flex flex-col gap-6 cursor-pointer transition-all duration-300"
                                    spotlightColor={feature.spotlightColor}
                                    onClick={(e) => toggleCard(e, index)}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`h-14 w-14 flex items-center justify-center rounded-xl ${feature.iconBg} border ${feature.iconBorder}`}
                                    >
                                        <Icon
                                            className={`${feature.iconColor} h-7 w-7`}
                                        />
                                    </div>

                                    {/* Title & Short Description */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-2xl font-semibold text-white">
                                                {feature.title}
                                            </h3>
                                            <motion.div
                                                animate={{
                                                    rotate: isExpanded
                                                        ? 180
                                                        : 0,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronDown className="w-6 h-6 text-neutral-400" />
                                            </motion.div>
                                        </div>
                                        <p className="text-base text-neutral-400 leading-relaxed">
                                            {feature.shortDescription}
                                        </p>
                                    </div>

                                    {/* Expandable Details */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                key={`expandable-${index}`}
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 border-t border-neutral-700/50 mt-2">
                                                    <ul className="space-y-3">
                                                        {feature.details.map(
                                                            (detail, i) => (
                                                                <motion.li
                                                                    key={`${index}-detail-${i}`}
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -10,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            i *
                                                                            0.05,
                                                                    }}
                                                                    className="flex items-start gap-3 text-sm text-neutral-300"
                                                                >
                                                                    <span className="text-white mt-0.5 text-base">
                                                                        •
                                                                    </span>
                                                                    <span className="leading-relaxed">
                                                                        {detail}
                                                                    </span>
                                                                </motion.li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </SpotlightCard>
                            </motion.div>
                        );
                    })}
                </div>

        
            </div>
        </section>
    );
};
