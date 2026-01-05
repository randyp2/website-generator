"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FileText } from 'lucide-react';

export function VisualFeaturesSection() {
    return (
        <section className="bg-[#26282a] py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6">
                {/* Grid: Bento grid on desktop, 1 column on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 auto-rows-auto">

                    {/* Card 1: AI-Powered Website Generation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="lg:col-span-8 lg:row-span-2"
                    >
                        <div className="relative h-[450px] lg:h-[656px] overflow-hidden group rounded-xl border border-white/10 hover:border-white/30 transition-all bg-[#1a1d21]">
                            {/* Content Container */}
                            <div className="relative h-full flex flex-col">
                                {/* Contained Image with Chatbot Overlay - Extended to right edge, less tall */}
                                <div className="relative rounded-lg overflow-visible ml-6 md:ml-8 mt-10 md:mt-16 mr-0 mb-0 h-[250px] md:h-[280px]">
                                    {/* Background Image */}
                                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                                        <Image
                                            src="/images/card1.png"
                                            alt="Portfolio website example"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            priority
                                        />
                                        {/* Fade Overlay - minimal fade from bottom-left corner only */}
                                        <div className="absolute inset-0 bg-linear-to-tr from-[#1a1d21]/30 via-transparent to-transparent" />
                                    </div>

                                    {/* Complete Chat UI Overlay - Poking out from top */}
                                    <div className="relative h-full flex items-start justify-center -mt-8 md:mt-40">
                                        {/* Dark Transparent Chatbox */}
                                        <div className="w-full max-w-sm bg-black/85 backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl overflow-hidden">
                                            {/* Chat Messages Area */}
                                            <div className="p-3 md:p-4 space-y-2 max-h-[140px] md:max-h-40 overflow-y-auto">
                                                {/* User Message */}
                                                <div className="flex justify-end">
                                                    <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg rounded-tr-sm px-3 py-1.5 max-w-[85%] shadow-lg">
                                                        <p className="text-white text-[10px] md:text-xs leading-relaxed">
                                                            Create a cyber-themed portfolio for a software engineer
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* AI Response */}
                                                <div className="flex items-start gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-linear-to-br from-white-500 to-gray-500 flex items-center justify-center shrink-0 shadow-lg">

                                                    </div>
                                                    <div className="bg-white/10 border border-white/20 rounded-lg rounded-tl-sm px-3 py-1.5 max-w-[85%] shadow-xl">
                                                        <p className="text-white/90 text-[10px] md:text-xs leading-relaxed">
                                                            I've created a sleek portfolio with a dark theme, featuring your projects, skills, and experience.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Input Field */}
                                            <div className="border-t border-white/10 p-2 md:p-3 bg-black/20">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Type your message..."
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-[10px] md:text-xs placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                                                        disabled
                                                    />
                                                    <button className="bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors">
                                                        <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Spacer to push title to bottom */}
                                <div className="flex-1"></div>

                                {/* Title at Bottom - touching bottom with padding */}
                                <div className="px-6 md:px-8 pb-4 md:pb-6 pt-3">
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                                        AI-Powered Website Generation
                                    </h3>
                                    <p className="text-xs md:text-sm text-white/70">
                                        Describe your vision, and our AI creates a stunning portfolio in seconds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Resume Upload */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4 lg:row-span-1"
                    >
                        <div className="relative h-[450px] lg:h-[316px] overflow-hidden group rounded-xl border border-white/10 hover:border-white/30 transition-all bg-[#1a1d21]">
                            {/* Title at Top */}
                            <div className="relative z-10 p-6 md:pt-20 md:px-8">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                                    Upload Your Resume
                                </h3>
                                <p className="text-xs md:text-sm text-white/70">
                                    Simply upload your resume and let AI extract all your information instantly.
                                </p>
                            </div>

                            {/* Image from bottom left */}
                            <div className=" absolute -bottom-20 -left-20 w-full h-[70%]">
                                <Image
                                    src="/images/card2.png"
                                    alt="Resume upload interface"
                                    fill
                                    className="rounded-4xl object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Real-time Customization */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4 lg:row-span-1"
                    >
                        <div className="relative h-[450px] lg:h-[316px] overflow-hidden group rounded-xl border border-white/10 hover:border-white/30 transition-all bg-[#1a1d21]">
                            {/* Image from top right */}
                            <div className="absolute top-0 right-0 w-full h-[70%]">
                                <Image
                                    src="/images/card3.png"
                                    alt="Real-time customization interface"
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                {/* Fade overlay from bottom */}
                                <div className="absolute inset-0 bg-linear-to-t from-[#1a1d21] via-transparent to-transparent" />
                            </div>

                            {/* Title at Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
                                    Real-time Customization
                                </h3>
                                <p className="text-xs md:text-sm text-white/70">
                                    See your changes instantly as you customize colors, fonts, and layouts.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 4: Deploy & Share */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="lg:col-span-3 lg:row-span-1"
                    >
                        <div className="relative bg-linear-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-3xl border border-white/10 p-6 md:p-8 hover:border-white/20 transition-all h-[450px] lg:h-[380px]">
                            <div className="mb-4 md:mb-6">
                                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 md:mb-3">
                                    Deploy in one click
                                </h3>
                                <p className="text-sm md:text-base text-white/70">
                                    Publish your portfolio to the web instantly or download the code to host anywhere.
                                </p>
                            </div>
                            <DeploymentVisual />
                        </div>
                    </motion.div>

                    {/* Card 5: Portfolio Analytics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="lg:col-span-9 lg:row-span-1"
                    >
                        <div className="relative h-[300px] lg:h-[380px] overflow-hidden group rounded-xl border border-white/10 hover:border-white/30 transition-all bg-[#1a1d21]">
                            {/* Analytics Visual - Chart/Graph */}
                            <div className="absolute inset-0 flex items-center justify-center p-8 opacity-20">
                                <svg className="w-full h-full text-green-400" fill="none" viewBox="0 0 400 200">
                                    {/* Upward trending line chart */}
                                    <polyline
                                        points="20,150 80,120 140,100 200,80 260,60 320,40 380,20"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {/* Dots on the line */}
                                    <circle cx="20" cy="150" r="4" fill="currentColor" />
                                    <circle cx="80" cy="120" r="4" fill="currentColor" />
                                    <circle cx="140" cy="100" r="4" fill="currentColor" />
                                    <circle cx="200" cy="80" r="4" fill="currentColor" />
                                    <circle cx="260" cy="60" r="4" fill="currentColor" />
                                    <circle cx="320" cy="40" r="4" fill="currentColor" />
                                    <circle cx="380" cy="20" r="4" fill="currentColor" />
                                    {/* Gradient fill under line */}
                                    <defs>
                                        <linearGradient id="analyticsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <polygon
                                        points="20,150 80,120 140,100 200,80 260,60 320,40 380,20 380,180 20,180"
                                        fill="url(#analyticsGradient)"
                                    />
                                </svg>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                                <div>
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                        Portfolio Analytics
                                    </h3>
                                    <p className="text-xs md:text-sm text-white/70">
                                        Track views, engagement trends, and visitor behavior with real-time analytics dashboard.
                                    </p>
                                </div>

                                {/* Mock Stats */}
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="bg-white/5 rounded-lg p-2 md:p-3 border border-white/10">
                                        <p className="text-green-400 text-lg md:text-xl font-bold">2.4K</p>
                                        <p className="text-white/50 text-[10px] md:text-xs">Views</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2 md:p-3 border border-white/10">
                                        <p className="text-blue-400 text-lg md:text-xl font-bold">89%</p>
                                        <p className="text-white/50 text-[10px] md:text-xs">Engagement</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2 md:p-3 border border-white/10">
                                        <p className="text-purple-400 text-lg md:text-xl font-bold">156</p>
                                        <p className="text-white/50 text-[10px] md:text-xs">Exports</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// Visual Component 2: Template Selection
const TemplateSelectionVisual = () => (
    <div className="relative h-64">
        {/* Header - Top left */}
        <div className="absolute top-0 left-0 right-0 bg-[#1a1d21] rounded-xl px-4 py-3 border border-white/10 shadow-2xl z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-white/80 text-xs font-medium">Choose Template</span>
            </div>
            <span className="px-2 py-1 bg-green-500/20 rounded-full text-green-400 text-[10px] font-medium">✨ AI Match</span>
        </div>

        {/* Template 1 - Coming from left, larger */}
        <div className="absolute top-16 left-0 w-44 bg-[#1a1d21] rounded-lg p-3 border-2 border-blue-400 shadow-2xl z-30">
            <div className="aspect-3/4 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded mb-2 overflow-hidden">
                <div className="w-full h-full p-2 space-y-1">
                    <div className="h-2 bg-white/30 rounded w-3/4"></div>
                    <div className="h-1 bg-white/20 rounded w-1/2"></div>
                    <div className="mt-2 h-1 bg-white/10 rounded w-full"></div>
                    <div className="h-1 bg-white/10 rounded w-5/6"></div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-white text-xs font-medium">Modern</p>
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                </div>
            </div>
        </div>

        {/* Template 2 - Coming from right, slightly smaller */}
        <div className="absolute top-24 right-0 w-36 bg-[#1a1d21] rounded-lg p-3 border border-white/10 shadow-2xl z-20 opacity-60">
            <div className="aspect-3/4 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded mb-2 overflow-hidden">
                <div className="w-full h-full p-2 space-y-1">
                    <div className="h-2 bg-white/30 rounded w-2/3"></div>
                    <div className="h-1 bg-white/20 rounded w-1/3"></div>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                        <div className="h-3 bg-white/10 rounded"></div>
                        <div className="h-3 bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>
            <p className="text-white text-xs font-medium">Creative</p>
        </div>

        {/* Template 3 - Peek from bottom */}
        <div className="absolute bottom-0 left-16 right-16 bg-[#1a1d21] rounded-t-lg p-3 border border-white/10 border-b-0 shadow-2xl z-10 opacity-40">
            <div className="h-16 bg-linear-to-br from-green-500/20 to-teal-500/20 rounded"></div>
        </div>
    </div>
);

// Visual Component 3: Live Preview
const LivePreviewVisual = () => (
    <div className="relative h-64">
        {/* Mac Browser Window - Main element */}
        <div className="absolute top-0 left-0 right-0 bg-[#1a1d21] rounded-xl shadow-2xl z-20 border border-white/10">
            {/* Browser Chrome */}
            <div className="bg-[#2d3139] px-3 py-2 rounded-t-xl border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="flex-1 bg-[#1a1d21] rounded px-2 py-1 flex items-center gap-1.5">
                        <div className="text-[10px]">🔒</div>
                        <span className="text-white/60 text-[10px] font-mono">johndoe.vercel.app</span>
                    </div>
                </div>
            </div>

            {/* Portfolio Preview */}
            <div className="bg-[#0f1115] p-4 rounded-b-xl">
                <div className="bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-2/3 mb-1.5"></div>
                    <div className="h-2 bg-white/10 rounded w-1/2"></div>
                </div>
            </div>
        </div>

        {/* Project Cards - Overlapping from bottom */}
        <div className="absolute bottom-0 left-4 right-4 bg-[#1a1d21] rounded-xl p-4 border border-white/10 shadow-2xl z-30">
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded p-2 border border-white/10">
                    <div className="aspect-video bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded mb-1.5"></div>
                    <div className="h-1.5 bg-white/15 rounded w-3/4"></div>
                </div>
                <div className="bg-white/5 rounded p-2 border border-white/10">
                    <div className="aspect-video bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded mb-1.5"></div>
                    <div className="h-1.5 bg-white/15 rounded w-2/3"></div>
                </div>
            </div>
        </div>
    </div>
);

// Visual Component 4: Deployment
const DeploymentVisual = () => (
    <div className="relative h-80">
        {/* Build Status - Top card */}
        <div className="absolute top-0 left-0 right-0 bg-[#1a1d21] rounded-xl p-4 border border-white/10 shadow-2xl z-20">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="text-green-400 text-sm">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">Build Successful</p>
                    <p className="text-white/50 text-[10px] truncate">johndoe-portfolio • main</p>
                </div>
                <span className="text-white/40 text-[10px] shrink-0">2m ago</span>
            </div>

            {/* Build Steps */}
            <div className="space-y-1.5 pl-10">
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <span className="text-green-400 text-xs">✓</span>
                    <span>Installing dependencies</span>
                    <span className="ml-auto text-white/40">12s</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <span className="text-green-400 text-xs">✓</span>
                    <span>Building application</span>
                    <span className="ml-auto text-white/40">45s</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <span className="text-green-400 text-xs">✓</span>
                    <span>Optimizing assets</span>
                    <span className="ml-auto text-white/40">8s</span>
                </div>
            </div>
        </div>

        {/* Deploy Button - Coming from left */}
        <div className="absolute bottom-12 left-0 right-12 bg-linear-to-r from-blue-600 to-blue-500 rounded-lg p-3 shadow-2xl z-30 border border-blue-400/20">
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm">▲</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-xs">Deploy Now</p>
                    <p className="text-white/80 text-[10px]">Live in ~30 seconds</p>
                </div>
                <span className="text-white text-sm shrink-0">→</span>
            </div>
        </div>

        {/* Secondary Actions - Bottom right */}
        <div className="absolute bottom-0 right-0 left-20 flex gap-2 z-20">
            <button className="flex-1 bg-[#1a1d21] border border-white/10 rounded-lg p-2 shadow-xl">
                <p className="text-white text-[10px] font-medium">Preview</p>
            </button>
            <button className="flex-1 bg-[#1a1d21] border border-white/10 rounded-lg p-2 shadow-xl">
                <p className="text-white text-[10px] font-medium">Download</p>
            </button>
        </div>
    </div>
);
