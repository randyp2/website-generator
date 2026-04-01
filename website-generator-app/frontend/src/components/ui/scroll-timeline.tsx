"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface TimelineStepItemProps {
    step: TimelineStep;
    isLast: boolean;
    scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
    index: number;
    totalSteps: number;
}

const TimelineStepItem: React.FC<TimelineStepItemProps> = ({
    step,
    isLast,
    scrollYProgress,
    index,
    totalSteps,
}) => {
    const Icon = step.icon;
    const segmentSize = 0.5 / Math.max(totalSteps - 1, 1);
    const start = 0.15 + index * segmentSize;
    const end = start + segmentSize;
    const lineHeight = useTransform(scrollYProgress, [start, end], ["0%", "100%"]);

    return (
        <div className="flex gap-6 flex-1">
            {/* Icon and Line Column */}
            <div className="flex flex-col items-center">
                {/* Icon Box - Outer container with gradient border */}
                <div className="relative w-12 h-12 rounded-xl p-[1px] bg-gradient-to-t from-black to-neutral-500 flex-shrink-0">
                    {/* Inner container with shiny top strip */}
                    <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center overflow-hidden relative">
                        {/* White strip at top for shiny effect */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                    <div className="relative w-0.5 flex-1 min-h-[120px] mt-4">
                        {/* Base line (dim) */}
                        <div className="absolute inset-0 bg-white/10 rounded-full" />
                        {/* Animated highlight line */}
                        <motion.div
                            className="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-blue-500 rounded-full"
                            style={{ height: lineHeight }}
                        />
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className="pt-2 flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                    {step.description}
                </p>
            </div>
        </div>
    );
};

export interface ScrollTimelineProps {
    steps: TimelineStep[];
    className?: string;
}

export const ScrollTimeline: React.FC<ScrollTimelineProps> = ({
    steps,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    return (
        <div
            ref={containerRef}
            className={cn("flex flex-col h-full", className)}
        >
            {steps.map((step, index) => (
                <TimelineStepItem
                    key={index}
                    step={step}
                    isLast={index === steps.length - 1}
                    scrollYProgress={scrollYProgress}
                    index={index}
                    totalSteps={steps.length}
                />
            ))}
        </div>
    );
};
