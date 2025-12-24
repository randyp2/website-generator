"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

// AI prompt input bubbles that float around
function PromptBubble({
    className,
    delay = 0,
    prompt,
    rotate = 0,
}: {
    className?: string;
    delay?: number;
    prompt: string;
    rotate?: number;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -100,
                rotate: rotate - 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 10 + Math.random() * 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                className="relative"
            >
                {/* Input-like container with send button */}
                <div
                    className={cn(
                        "flex items-center gap-3",
                        "px-5 py-4 rounded-2xl",
                        "bg-white/90 backdrop-blur-md",
                        "border border-slate-200/80",
                        "shadow-xl shadow-sky-500/10",
                        "min-w-[280px] md:min-w-[360px]"
                    )}
                >
                    {/* Prompt text */}
                    <span className="flex-1 text-base md:text-lg text-slate-600 font-medium">
                        {prompt}
                    </span>

                    {/* Send button */}
                    <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-400/30">
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function HeroGeometric({
    title1 = "Elevate Your Digital Vision",
    title2 = "Crafting Exceptional Websites",
    description = "Crafting exceptional digital experiences through innovative design and cutting-edge technology.",
}: {
    title1?: string;
    title2?: string;
    description?: string;
}) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
            },
        }),
    };

    // Sample AI prompts for the floating bubbles
    const prompts = [
        { text: "Make my portfolio modern and clean...", delay: 0.3, rotate: 5, position: "left-[2%] md:left-[8%] top-[18%] md:top-[22%]" },
        { text: "Highlight my React skills prominently", delay: 0.5, rotate: -3, position: "right-[3%] md:right-[10%] top-[65%] md:top-[70%]" },
        { text: "Add smooth animations", delay: 0.4, rotate: -6, position: "left-[5%] md:left-[12%] bottom-[12%] md:bottom-[15%]" },
        { text: "Show 5 years of experience", delay: 0.6, rotate: 4, position: "right-[8%] md:right-[15%] top-[12%] md:top-[18%]" },
        { text: "Use a professional color scheme", delay: 0.7, rotate: -4, position: "left-[15%] md:left-[20%] top-[5%] md:top-[8%]" },
    ];

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-100">
            {/* Soft gradient background overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100/40 via-transparent to-cyan-100/40 blur-3xl" />
            <div className="absolute top-20 left-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-20 right-0 w-96 h-96 bg-sky-200 rounded-full blur-3xl opacity-20 animate-pulse" />

            {/* Floating AI Prompt Bubbles */}
            <div className="absolute inset-0 overflow-hidden">
                {prompts.map((prompt, index) => (
                    <PromptBubble
                        key={index}
                        delay={prompt.delay}
                        prompt={prompt.text}
                        rotate={prompt.rotate}
                        className={prompt.position}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Title */}
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight leading-tight">
                            <span className="text-slate-900">
                                {title1}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600"
                                )}
                            >
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
                            {description}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Subtle gradient fade at edges */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
        </div>
    );
}

export { HeroGeometric }
