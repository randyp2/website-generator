"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import { FcCheckmark } from "react-icons/fc";
import { PortfolioMockup } from "./PortfolioMockup";
import { RiAiGenerate2 } from "react-icons/ri";


const trustBadges = [
    {
        label: "Free Generation",
    },
    {
        label: "Ready in 5 Minutes",
    },
    {
        label: "No Coding Required",
    },
];

export const HeroSection: React.FC = () => {
    const router = useRouter();
    const [typewriterText, setTypewriterText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const [typingComplete, setTypingComplete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    /* ---------- TYPEWRITER EFFECT LOGIC ---------- */
    /**
     * Write the incorrect text, delete it, then write the correct text
     * - Manages phases of typing, deleting, and pauses for natural effect
     */
    useEffect(() => {

        // Texts for the typewriter effect
        const incorrectText = "created manually";
        const correctText = "beautifully automated";
        let currentIndex = 0;
        let currentPhase: "typing-wrong" | "pause-wrong" | "deleting" | "pause-empty" | "typing-correct" | "done" = "typing-wrong";
        let pauseTimeout: NodeJS.Timeout | null = null;

        const typeInterval = setInterval(() => {
            // Phase 1: Type incorrect text
            if (currentPhase === "typing-wrong") {
                if (currentIndex <= incorrectText.length) {
                    setTypewriterText(incorrectText.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    currentPhase = "pause-wrong";
                    pauseTimeout = setTimeout(() => {
                        currentPhase = "deleting";
                        setIsDeleting(true);
                    }, 800); // Pause before deleting
                }
            }
            // Phase 2: Delete incorrect text
            else if (currentPhase === "deleting") {
                if (currentIndex > 0) {
                    currentIndex--;
                    setTypewriterText(incorrectText.slice(0, currentIndex));
                } else {
                    setIsDeleting(false);
                    currentPhase = "pause-empty";
                    pauseTimeout = setTimeout(() => {
                        currentPhase = "typing-correct";
                        currentIndex = 0;
                    }, 300); // Brief pause when empty
                }
            }
            // Phase 3: Type correct text
            else if (currentPhase === "typing-correct") {
                if (currentIndex <= correctText.length) {
                    setTypewriterText(correctText.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    currentPhase = "done";
                    setTypingComplete(true);
                    setShowCursor(false); // Hide cursor immediately when done
                    clearInterval(typeInterval);
                }
            }
        }, isDeleting ? 40 : 70); // Faster when deleting, varied speed for natural feel

        return () => {
            clearInterval(typeInterval);
            if (pauseTimeout) clearTimeout(pauseTimeout);
        };
    }, []); // Run once on mount

    // Cursor blink effect (only while typing)
    useEffect(() => {
        if (typingComplete) return; // Stop blinking when typing is complete

        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530); // Blink speed

        return () => clearInterval(cursorInterval);
    }, [typingComplete]); // Re-run when typingComplete changes

    return (
        <section className="relative pt-20 pb-20 px-6 overflow-hidden bg-gray-100">

            {/* Light circle blur background animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-0 w-96 h-96 bg-cyan-200 rounded-full blur-2xl opacity-30 animate-float-slow" />
                <div className="absolute -top-10 left-1/2 w-96 h-96 bg-teal-200 rounded-full blur-2xl opacity-20 animate-float-slower" />
            </div>

            {/* Header content container */}
            <div className="max-w-7xl mx-auto relative z-10 ">

                {/* Header main detail section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                        Your professional story,
                        <br />
                        <span className="bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                            {typewriterText}
                            {showCursor && (
                                <span className="inline-block w-1 h-[0.9em] bg-linear-to-r from-sky-600 to-cyan-600 ml-1 align-middle animate-pulse" />
                            )}
                        </span>
                    </h1>

                    {/* Subheadline - Hidden until typing completes */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: typingComplete ? 1 : 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        Generate a portfolio that speaks for your craft. AI-crafted
                        portfolios with human polish — ready in minutes, customizable to
                        perfection.
                    </motion.p>

                    {/* Trust Badges - Hidden until typing completes */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: typingComplete ? 1 : 0 }}
                        transition={{ delay: typingComplete ? 0.2 : 0, duration: 0.6 }}
                        className="flex flex-wrap justify-center gap-2 mb-10"
                    >
                        {trustBadges.map((badge, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: typingComplete ? 1 : 0 }}
                                transition={{
                                    delay: typingComplete ? 0.3 + index * 0.1 : 0,
                                    duration: 0.4
                                }}
                                className="px-4 py-2  text-slate-700  text-sm font-medium  flex flex-row items-center gap-2"
                            >
                                <div><FcCheckmark /></div>
                                <div>{badge.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons - Hidden until typing completes */}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: typingComplete ? 1 : 0 }}
                        transition={{ delay: typingComplete ? 0.6 : 0, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: typingComplete ? 1 : 0,
                                scale: typingComplete ? [1, 1.03, 1] : 1,
                            }}
                            transition={{
                                opacity: { delay: typingComplete ? 0.7 : 0, duration: 0.4 },
                                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                            whileHover="hover"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard")}
                            className="group relative px-8 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 overflow-hidden cursor-pointer shadow-lg shadow-sky-400/40"
                        >
                            {/* Idle pulsating glow - More noticeable */}
                            <motion.div
                                className="absolute inset-0 rounded-xl"
                                animate={{
                                    boxShadow: typingComplete ? [
                                        "0 0 20px rgba(14, 165, 233, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)",
                                        "0 0 50px rgba(14, 165, 233, 1), 0 0 100px rgba(6, 182, 212, 0.8)",
                                        "0 0 20px rgba(14, 165, 233, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)"
                                    ] : "0 0 0px rgba(0,0,0,0)"
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Shimmer shine effect - slides across on hover, returns on leave */}
                            <motion.div
                                className="absolute inset-y-0 w-1/3"
                                style={{
                                    background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)",
                                    left: "-33%",
                                }}
                                variants={{
                                    hover: {
                                        left: "100%"
                                    }
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Button content wrapper with scale on hover */}
                            <motion.div
                                className="relative flex items-center gap-2 z-10"
                                variants={{
                                    hover: { scale: 1.05 }
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                {/* Icon with rotation */}
                                <motion.div
                                    variants={{
                                        hover: { rotate: 360, scale: 1.2 }
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <RiAiGenerate2 className="w-5 h-5" />
                                </motion.div>

                                {/* Text with letter spacing */}
                                <motion.span
                                    variants={{
                                        hover: { letterSpacing: "0.05em" }
                                    }}
                                >
                                    Generate Now
                                </motion.span>
                            </motion.div>
                        </motion.button>

                    </motion.div>
                </motion.div>


                {/* Portfolio Preview Mockup - Hidden until typing completes */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: typingComplete ? 1 : 0 }}
                    transition={{ delay: typingComplete ? 1 : 0, duration: 0.8 }}
                >
                    <PortfolioMockup />
                </motion.div>

                {/* Social Proof - Hidden until typing completes */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: typingComplete ? 1 : 0 }}
                    transition={{ delay: typingComplete ? 1.4 : 0, duration: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-slate-500 text-sm mb-4">
                        Trusted by professionals worldwide
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full bg-linear-to-br from-sky-200 to-cyan-300 border-2 border-white flex items-center justify-center text-xs font-bold text-sky-700"
                                >
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-slate-900">10,000+</div>
                            <div className="text-xs text-slate-600">portfolios created</div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
