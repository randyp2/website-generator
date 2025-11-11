"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    FiZap,
    FiSend,
    FiRefreshCw,
    FiCheck,
    FiArrowRight,
    FiStar,
} from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { IconType } from "react-icons";

/**
 * MODULE 3: CREATE PORTFOLIO FLOW - STEP 2: AI REFINEMENT PANEL
 * 
 * Design Goals:
 * - Split-screen: Preview on left, AI chat on right
 * - Chip suggestions for common requests (low barrier to entry)
 * - Real-time preview updates (instant feedback loop)
 * - Natural conversation flow (friendly, not robotic)
 * - Clear "Apply" vs "Try Another" decision points
 */

const AIRefinementPanel: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId") ?? "minimal-tech";


    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
        {
            role: "ai",
            content: `Great choice! I'll help you customize this ${templateId.replace("-", " ")} template. What would you like to change?`,
        },
    ]);

    const suggestionChips: { label: string; icon: IconType }[] = [
        { label: "Make it futuristic", icon: FiZap },
        { label: "Add minimal contact section", icon: FiStar },
        { label: "Make About Me more confident", icon: FiCheck },
        { label: "Use darker colors", icon: FiRefreshCw },
        { label: "Add project showcase grid", icon: FiZap },
        { label: "More whitespace please", icon: FiStar },
    ];

    const handleSendPrompt = async (customPrompt?: string) => {
        const messageToSend = customPrompt || prompt;
        if (!messageToSend.trim()) return;

        // Add user message
        setMessages((prev) => [
            ...prev,
            { role: "user", content: messageToSend },
        ]);
        setPrompt("");
        setIsGenerating(true);

        // Simulate AI response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: `Perfect! I've updated the ${templateId} template to ${messageToSend.toLowerCase()}. Check the preview on the left. Like what you see?`,
                },
            ]);
            setIsGenerating(false);
        }, 1500);
    };

    const handleFinalize = () => {
        router.push("/dashboard/portfolios");
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-100 rounded-full text-cyan-700 font-semibold text-sm">
                            <FiZap className="w-4 h-4" />
                            Step 2 of 2: AI Refinement
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Customize Your Portfolio
                        </h2>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinalize}
                        className="px-6 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-sky-400/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all flex items-center gap-2"
                    >
                        <FiCheck className="w-5 h-5" />
                        Finalize Portfolio
                    </motion.button>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Live Preview */}
                <div className="flex-1 bg-linear-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
                    <motion.div
                        key={messages.length} // Re-animate on update
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Preview Card */}
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            {/* Mock Browser Chrome */}
                            <div className="bg-slate-200 px-4 py-3 flex items-center gap-2 border-b border-slate-300">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 mx-4 text-xs text-slate-600 bg-white rounded px-3 py-1">
                                    portfolio-preview.local
                                </div>
                            </div>

                            {/* Portfolio Preview Content */}
                            <div className="p-12 min-h-[600px] bg-linear-to-br from-slate-900 via-slate-800 to-slate-700">
                                <div className="text-center space-y-6">
                                    <motion.div
                                        animate={{ scale: [0.95, 1, 0.95] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="w-24 h-24 bg-linear-to-br from-sky-400 to-cyan-400 rounded-full mx-auto"
                                    />
                                    <h1 className="text-4xl font-bold text-white">Your Name</h1>
                                    <p className="text-slate-300 text-lg">Software Engineer</p>

                                    <div className="flex flex-wrap gap-3 justify-center mt-8">
                                        {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-12 text-center">
                                        <p className="text-slate-400 text-sm">
                                            Live preview updates as you refine →
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: AI Chat Panel */}
                <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-auto p-6 space-y-4">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl ${message.role === "user"
                                                ? "bg-linear-to-r from-sky-500 to-cyan-500 text-white"
                                                : "bg-slate-100 text-slate-900"
                                            }`}
                                    >
                                        {message.role === "ai" && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 bg-linear-to-br from-sky-400 to-cyan-400 rounded-full flex items-center justify-center">
                                                    <FiZap className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600">
                                                    AI Assistant
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Generating Indicator */}
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-slate-100 px-4 py-3 rounded-2xl flex items-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <FiRefreshCw className="w-4 h-4 text-sky-600" />
                                    </motion.div>
                                    <span className="text-sm text-slate-600">Generating...</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Suggestion Chips */}
                    <div className="p-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-3 font-medium">
                            Quick Suggestions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {suggestionChips.map((chip, index) => {
                                const Icon = chip.icon;
                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSendPrompt(chip.label)}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-sky-100 border border-slate-200 hover:border-sky-300 rounded-lg text-sm text-slate-700 hover:text-sky-700 transition-all"
                                    >
                                        <Icon className="w-3 h-3" /> {/* ✅ Type-safe and clean */}
                                        {chip.label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendPrompt()}
                                placeholder="Describe what you want to change..."
                                className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all text-sm"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSendPrompt()}
                                disabled={!prompt.trim() || isGenerating}
                                className="px-4 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-sky-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSend className="w-5 h-5" />
                            </motion.button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Tip: Be specific! "Add a dark mode toggle" works better than "make it dark"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIRefinementPanel;
