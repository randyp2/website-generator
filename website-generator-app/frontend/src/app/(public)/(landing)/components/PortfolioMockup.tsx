"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import {
    FiGlobe,
    FiLayout,
    FiCheck,
    FiTrendingUp,
    FiStar,
    FiUpload,
    FiZap,
    FiEdit3,
    FiDownload,
    FiTarget,
} from "react-icons/fi";
import { ImHourGlass } from "react-icons/im";

export const PortfolioMockup: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);

    // Cycle through steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4);
        }, 3500); // Change step every 3.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className="mt-20"
        >
            <div className="relative max-w-7xl mx-auto px-4">
                {/* Step indicators */}
                <div className="relative z-20 flex justify-center items-center mb-12">
                    {[
                        { num: 1, label: "Upload & Prompt", icon: FiUpload },
                        { num: 2, label: "AI Generates", icon: FiZap },
                        { num: 3, label: "Customize", icon: FiEdit3 },
                        { num: 4, label: "Deploy", icon: FiDownload },
                    ].map((step, i) => (
                        <React.Fragment key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                                className="flex flex-col items-center gap-2 relative"
                            >
                                {/* Glow effect when active */}
                                {activeStep === i && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute -inset-3 bg-linear-to-r from-cyan-400/30 to-sky-400/30 rounded-full blur-2xl"
                                    />
                                )}

                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            scale: activeStep === i ? 1.1 : 1,
                                            boxShadow:
                                                activeStep === i
                                                    ? "0 0 20px rgba(6, 182, 212, 0.5)"
                                                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-sky-500 flex items-center justify-center text-white font-bold relative z-10"
                                    >
                                        {step.num}
                                    </motion.div>
                                </div>
                                <span className="text-xs font-medium text-slate-600 whitespace-nowrap relative z-10">
                                    {step.label}
                                </span>
                            </motion.div>

                            {/* Connecting line with animated glow */}
                            {i < 3 && (
                                <div className="relative mx-4 w-24 h-0.5 bg-slate-200">
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{
                                            scaleX: activeStep > i ? 1 : 0,
                                            opacity: activeStep === i ? 1 : activeStep > i ? 0.6 : 0,
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 bg-linear-to-r from-cyan-400 to-sky-400 origin-left"
                                        style={{
                                            boxShadow:
                                                activeStep === i
                                                    ? "0 0 10px rgba(6, 182, 212, 0.8)"
                                                    : "none",
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Desktop: Portfolio with overlaid cards | Stack layout in mobile phones */}
                <div className="relative">
                    {/* Marketing Portfolio Preview - Hidden on mobile/tablet */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="hidden xl:block relative bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden mx-12"
                    >
                        {/* Browser Chrome */}
                        <div className="bg-linear-to-r from-slate-100 to-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
                                    <FiGlobe className="w-3 h-3" />
                                    <span>sarahjohnson.marketing</span>
                                </div>
                            </div>
                        </div>

                        {/* Portfolio Content Preview - Compact & Professional */}
                        <div className="relative bg-linear-to-br from-slate-50 via-white to-slate-50 min-h-[380px]">
                            {/* Navbar preview */}
                            <motion.nav
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4, duration: 0.6 }}
                                className="sticky top-0 bg-white/60 backdrop-blur-xl border-b border-slate-100/50 px-12 py-2.5 z-10"
                            >
                                <div className="flex items-center justify-between max-w-6xl mx-auto">
                                    {/* Minimal Logo */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center">
                                            <span className="text-white font-light text-xs tracking-wide">
                                                SJ
                                            </span>
                                        </div>
                                        <span className="font-light text-slate-900 text-sm tracking-wide">
                                            Sarah Johnson
                                        </span>
                                    </div>

                                    {/* Minimal Nav Links */}
                                    <div className="flex items-center gap-8">
                                        {["Work", "About", "Contact"].map((link, i) => (
                                            <motion.a
                                                key={i}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.6 + i * 0.1 }}
                                                className="text-xs font-light text-slate-600 hover:text-slate-900 cursor-pointer transition-colors tracking-wide"
                                            >
                                                {link}
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            </motion.nav>

                            {/* Hero Section - Compact Horizontal Layout */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.8, duration: 0.6 }}
                                className="px-12 py-8 relative"
                            >
                                {/* Subtle background gradient */}
                                <div className="absolute inset-0 bg-linear-to-r from-slate-50/50 via-transparent to-slate-50/50 pointer-events-none" />

                                <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8 items-center relative">
                                    {/* Left Content - Takes more space */}
                                    <div className="col-span-8 space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 2, duration: 0.6 }}
                                            className="space-y-2"
                                        >
                                            <div className="inline-flex items-center gap-2 text-[10px] font-light text-slate-500 tracking-widest uppercase">
                                                <div className="w-6 h-px bg-slate-300" />
                                                Digital Marketing
                                            </div>
                                            <h1 className="text-2xl font-light text-slate-900 leading-tight tracking-tight">
                                                Creating <span className="font-normal">meaningful</span>{" "}
                                                brand experiences
                                            </h1>
                                            <p className="text-xs text-slate-600 font-light leading-relaxed max-w-lg">
                                                Specializing in data-driven campaigns that connect
                                                brands with their audiences.
                                            </p>
                                        </motion.div>

                                        {/* Compact Stats & CTA Combined */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 2.2, duration: 0.6 }}
                                            className="flex items-center gap-6 pt-2"
                                        >
                                            {[
                                                { label: "Projects", value: "50+" },
                                                { label: "Awards", value: "15" },
                                                { label: "Success", value: "98%" },
                                            ].map((stat, i) => (
                                                <div key={i} className="flex items-baseline gap-1.5">
                                                    <div className="text-xl font-light text-slate-900">
                                                        {stat.value}
                                                    </div>
                                                    <div className="text-[10px] font-light text-slate-500 tracking-wide">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="h-6 w-px bg-slate-200 mx-2" />

                                            <button className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-light tracking-wide hover:bg-slate-800 transition-colors">
                                                View Work
                                            </button>
                                        </motion.div>
                                    </div>

                                    {/* Right - Compact Professional Image */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 2.2, duration: 0.6 }}
                                        className="col-span-4 relative"
                                    >
                                        <div className="aspect-3/4 rounded-sm bg-linear-to-br from-slate-200 via-slate-100 to-slate-200 relative overflow-hidden shadow-xl">
                                            {/* Subtle overlay */}
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/5 to-transparent" />

                                            {/* Professional photo placeholder */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center space-y-1.5">
                                                    <div className="w-12 h-12 mx-auto rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
                                                        <FiTarget className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <div className="text-[10px] font-light text-slate-400 tracking-wide">
                                                        Portrait
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Minimal corner accent */}
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-white/10 to-transparent" />
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Featured Work Section - Compact Glass Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.6, duration: 0.6 }}
                                className="px-12 pb-8"
                            >
                                <div className="max-w-6xl mx-auto">
                                    {/* Minimal Section Header */}
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="w-8 h-px bg-slate-300" />
                                        <h2 className="text-xs font-light text-slate-900 tracking-widest uppercase">
                                            Featured Work
                                        </h2>
                                    </div>

                                    {/* Compact Transparent Glass Cards */}
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            {
                                                title: "Social Launch",
                                                metric: "+250%",
                                                desc: "Engagement",
                                            },
                                            {
                                                title: "Brand Identity",
                                                metric: "2M+",
                                                desc: "Impressions",
                                            },
                                            { title: "Email Series", metric: "45%", desc: "CTR" },
                                            {
                                                title: "Content Strategy",
                                                metric: "$500K",
                                                desc: "Revenue",
                                            },
                                        ].map((campaign, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 2.8 + i * 0.1 }}
                                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                                className="group cursor-pointer"
                                            >
                                                {/* Compact Glass Card */}
                                                <div className="relative bg-white/40 backdrop-blur-xl rounded-sm border border-slate-200/50 overflow-hidden hover:bg-white/60 hover:border-slate-300/50 transition-all duration-300 shadow-sm hover:shadow-md">
                                                    {/* Content */}
                                                    <div className="relative p-4 space-y-2.5">
                                                        {/* Icon/Visual Element */}
                                                        <div className="w-8 h-8 rounded-full bg-slate-900/5 flex items-center justify-center group-hover:bg-slate-900/10 transition-colors">
                                                            <FiTrendingUp className="w-4 h-4 text-slate-600" />
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="font-light text-slate-900 text-xs tracking-wide">
                                                            {campaign.title}
                                                        </h3>

                                                        {/* Metric */}
                                                        <div className="space-y-0.5">
                                                            <div className="text-xl font-light text-slate-900">
                                                                {campaign.metric}
                                                            </div>
                                                            <div className="text-[10px] font-light text-slate-500 tracking-wide">
                                                                {campaign.desc}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Hover accent line */}
                                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Stats bar at bottom */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 3.4, duration: 0.6 }}
                            className="bg-linear-to-r from-purple-50 via-pink-50 to-blue-50 px-6 py-3 border-t border-slate-200 grid grid-cols-3 gap-4"
                        >
                            <div className="flex items-center gap-2 text-sm justify-center">
                                <FiCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-slate-600 font-medium text-xs">
                                    SEO Optimized
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm justify-center">
                                <FiTrendingUp className="w-4 h-4 text-purple-500" />
                                <span className="text-slate-600 font-medium text-xs">
                                    Mobile Ready
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm justify-center">
                                <FiStar className="w-4 h-4 text-amber-500" />
                                <span className="text-slate-600 font-medium text-xs">
                                    Analytics Ready
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Desktop: Overlaid Step Cards | Mobile/Tablet: Stacked Step Cards */}

                    {/* STEP 1: Upload & Prompt */}
                    <motion.div
                        initial={{ opacity: 0, x: -30, y: 20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="xl:absolute xl:top-8 xl:-left-4 z-40 w-full xl:w-[360px] mb-6 xl:mb-0"
                    >
                        <div className="relative max-w-md mx-auto xl:max-w-none">
                            {/* Fixed-length line traveling around border */}
                            {activeStep === 0 && (
                                <svg
                                    className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        x="4"
                                        y="4"
                                        width="calc(100% - 8px)"
                                        height="calc(100% - 8px)"
                                        rx="16"
                                        fill="none"
                                        stroke="url(#gradient1)"
                                        strokeWidth="4"
                                        strokeDasharray="150 750"
                                        strokeDashoffset="0"
                                        style={{
                                            filter:
                                                "drop-shadow(0 0 12px rgba(6, 182, 212, 0.8)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))",
                                        }}
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="900"
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    </rect>
                                    <defs>
                                        <linearGradient
                                            id="gradient1"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                                            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            )}

                            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-cyan-200/50 overflow-hidden">
                                {/* Header */}
                                <div className="bg-linear-to-r from-cyan-500/90 to-sky-500/90 backdrop-blur-sm px-4 py-2.5 flex items-center gap-2">
                                    <FiUpload className="w-4 h-4 text-white" />
                                    <span className="text-white font-semibold text-xs">
                                        Step 1: Your Input
                                    </span>
                                </div>

                                {/* Content - Extended Conversation */}
                                <div className="p-4 space-y-2.5 bg-linear-to-br from-slate-50/80 to-white/80 backdrop-blur-sm">
                                    {/* Message 1 - AI */}
                                    <div className="flex items-start gap-2">
                                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            AI
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-700 flex-1 shadow-sm border border-slate-100">
                                            Hi! I&apos;m here to build your portfolio. What&apos;s your field?
                                        </div>
                                    </div>

                                    {/* Message 2 - User */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.6 }}
                                        className="flex items-start gap-2 justify-end"
                                    >
                                        <div className="bg-linear-to-r from-cyan-100/90 to-sky-100/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-700 max-w-[200px] shadow-sm border border-cyan-200/50">
                                            I&apos;m a marketing major looking to showcase my campaigns
                                        </div>
                                        <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            ME
                                        </div>
                                    </motion.div>

                                    {/* Message 3 - AI */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.8 }}
                                        className="flex items-start gap-2"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            AI
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-700 flex-1 shadow-sm border border-slate-100">
                                            Perfect! Do you have a resume or samples to upload?
                                        </div>
                                    </motion.div>

                                    {/* Message 4 - User */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2 }}
                                        className="flex items-start gap-2 justify-end"
                                    >
                                        <div className="bg-linear-to-r from-cyan-100/90 to-sky-100/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-700 max-w-[200px] shadow-sm border border-cyan-200/50">
                                            Yes, uploading now!
                                        </div>
                                        <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            ME
                                        </div>
                                    </motion.div>

                                    {/* Upload section */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 2.2 }}
                                        className="border-2 border-dashed border-cyan-300/60 rounded-lg p-3 bg-white/70 backdrop-blur-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-100/80 flex items-center justify-center shrink-0">
                                                <FiUpload className="w-4 h-4 text-cyan-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-slate-700 mb-1">
                                                    Marketing_Resume.pdf
                                                </div>
                                                <div className="w-full bg-cyan-200/60 rounded-full h-1">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ delay: 2.4, duration: 1 }}
                                                        className="bg-cyan-500 h-1 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* STEP 2: AI Generates */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, y: 20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 1.6, duration: 0.8 }}
                        className="xl:absolute xl:top-24 xl:-right-4 z-40 w-full xl:w-[280px] mb-6 xl:mb-0"
                    >
                        <div className="relative max-w-md mx-auto xl:max-w-none">
                            {/* Fixed-length line traveling around border */}
                            {activeStep === 1 && (
                                <svg
                                    className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        x="4"
                                        y="4"
                                        width="calc(100% - 8px)"
                                        height="calc(100% - 8px)"
                                        rx="16"
                                        fill="none"
                                        stroke="url(#gradient2)"
                                        strokeWidth="4"
                                        strokeDasharray="120 680"
                                        strokeDashoffset="0"
                                        style={{
                                            filter:
                                                "drop-shadow(0 0 12px rgba(6, 182, 212, 0.8)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))",
                                        }}
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="800"
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    </rect>
                                    <defs>
                                        <linearGradient
                                            id="gradient2"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                                            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            )}

                            <div className="relative bg-linear-to-br from-cyan-400 via-sky-500 to-blue-600/10  backdrop-blur-md rounded-2xl shadow-2xl p-5 overflow-hidden">
                                {/* Static background */}
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/30 to-transparent" />
                                </div>

                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    {/* Only animate icon when active */}
                                    <motion.div
                                        animate={
                                            activeStep === 1
                                                ? {
                                                    rotate: [0, 360],
                                                }
                                                : { rotate: 0 }
                                        }
                                        transition={
                                            activeStep === 1
                                                ? {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }
                                                : {}
                                        }
                                    >
                                        <ImHourGlass className="w-10 h-10 text-white drop-shadow-lg" />
                                    </motion.div>
                                    <div className="text-white text-center">
                                        <div className="font-bold text-sm mb-1">
                                            Step 2: AI Crafting
                                        </div>
                                        <div className="text-xs opacity-90">
                                            Analyzing & Designing...
                                        </div>
                                    </div>

                                    {/* Loading dots - only animate when active */}
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={
                                                    activeStep === 1
                                                        ? {
                                                            scale: [1, 1.5, 1],
                                                            opacity: [0.5, 1, 0.5],
                                                        }
                                                        : {
                                                            scale: 1,
                                                            opacity: 0.5,
                                                        }
                                                }
                                                transition={
                                                    activeStep === 1
                                                        ? {
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            delay: i * 0.2,
                                                        }
                                                        : {}
                                                }
                                                className="w-2 h-2 rounded-full bg-white"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* STEP 3: Customize */}
                    <motion.div
                        initial={{ opacity: 0, x: -30, y: 20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 1.8, duration: 0.8 }}
                        className="xl:absolute xl:bottom-20 xl:-left-4 z-40 w-full xl:w-[320px] mb-6 xl:mb-0"
                    >
                        <div className="relative max-w-md mx-auto xl:max-w-none">
                            {/* Fixed-length line traveling around border */}
                            {activeStep === 2 && (
                                <svg
                                    className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        x="4"
                                        y="4"
                                        width="calc(100% - 8px)"
                                        height="calc(100% - 8px)"
                                        rx="16"
                                        fill="none"
                                        stroke="url(#gradient3)"
                                        strokeWidth="4"
                                        strokeDasharray="140 660"
                                        strokeDashoffset="0"
                                        style={{
                                            filter:
                                                "drop-shadow(0 0 12px rgba(6, 182, 212, 0.8)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))",
                                        }}
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="800"
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    </rect>
                                    <defs>
                                        <linearGradient
                                            id="gradient3"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                                            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            )}

                            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-cyan-200/50 overflow-hidden">
                                {/* Header */}
                                <div className="bg-linear-to-r from-cyan-500/90 to-sky-500/90 backdrop-blur-sm px-4 py-2.5 flex items-center gap-2">
                                    <FiEdit3 className="w-4 h-4 text-white" />
                                    <span className="text-white font-semibold text-xs">
                                        Step 3: Customize
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3 bg-linear-to-br from-slate-50/80 to-white/80 backdrop-blur-sm">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-700">
                                                Theme Color
                                            </span>
                                            <div className="flex gap-1.5">
                                                {["bg-cyan-500", "bg-purple-500", "bg-emerald-500"].map(
                                                    (color, i) => (
                                                        <motion.div
                                                            key={i}
                                                            whileHover={{ scale: 1.2 }}
                                                            className={`w-6 h-6 rounded-full ${color} border-2 border-white shadow-sm cursor-pointer`}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-700">
                                                Layout Style
                                            </span>
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        whileHover={{ scale: 1.1 }}
                                                        className="w-6 h-6 rounded bg-white border-2 border-slate-200 shadow-sm cursor-pointer flex items-center justify-center"
                                                    >
                                                        <FiLayout className="w-3 h-3 text-slate-400" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full px-4 py-2 bg-linear-to-r from-cyan-500 to-sky-500 text-white rounded-lg text-xs font-semibold shadow-md"
                                            >
                                                Apply Changes
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* STEP 4: Deploy */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, y: 20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 2, duration: 0.8 }}
                        className="xl:absolute xl:bottom-20 xl:-right-4 z-40 w-full xl:w-[300px] mb-6 xl:mb-0"
                    >
                        <div className="relative max-w-md mx-auto xl:max-w-none">
                            {/* Fixed-length line traveling around border */}
                            {activeStep === 3 && (
                                <svg
                                    className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        x="4"
                                        y="4"
                                        width="calc(100% - 8px)"
                                        height="calc(100% - 8px)"
                                        rx="16"
                                        fill="none"
                                        stroke="url(#gradient4)"
                                        strokeWidth="4"
                                        strokeDasharray="130 670"
                                        strokeDashoffset="0"
                                        style={{
                                            filter:
                                                "drop-shadow(0 0 12px rgba(6, 182, 212, 0.8)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))",
                                        }}
                                    >
                                        <animate
                                            attributeName="stroke-dashoffset"
                                            from="0"
                                            to="800"
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    </rect>
                                    <defs>
                                        <linearGradient
                                            id="gradient4"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                                            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            )}

                            <div className="relative bg-linear-to-br from-cyan-400 via-sky-500 to-blue-600/10 backdrop-blur-md rounded-2xl shadow-2xl p-5 overflow-hidden">
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <motion.div
                                        animate={
                                            activeStep === 3
                                                ? {
                                                    y: [0, -5, 0],
                                                }
                                                : { y: 0 }
                                        }
                                        transition={
                                            activeStep === 3
                                                ? {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }
                                                : {}
                                        }
                                        className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                                    >
                                        <FiDownload className="w-7 h-7 text-white drop-shadow-lg" />
                                    </motion.div>

                                    <div className="text-white text-center">
                                        <div className="font-bold text-sm mb-1">
                                            Step 4: Deploy!
                                        </div>
                                        <div className="text-xs opacity-90 mb-3">
                                            Go live in seconds
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-5 py-2 bg-white text-cyan-600 rounded-lg font-semibold text-xs shadow-lg"
                                        >
                                            Deploy Now
                                        </motion.button>
                                    </div>

                                    {/* Success checkmarks */}
                                    <div className="flex gap-2 mt-1">
                                        {["SSL", "CDN"].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 2.4 + i * 0.2, type: "spring" }}
                                                className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full"
                                            >
                                                <FiCheck className="w-3 h-3 text-white" />
                                                <span className="text-xs text-white font-medium">
                                                    {item}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
