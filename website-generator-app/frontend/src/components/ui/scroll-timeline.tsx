"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
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
    index: number;
    totalSteps: number;
    scrollProgress: MotionValue<number>;
}

const TimelineStepItem: React.FC<TimelineStepItemProps> = ({
    step,
    isLast,
    index,
    totalSteps,
    scrollProgress,
}) => {
    const Icon = step.icon;
    const segmentSize = totalSteps > 1 ? 0.5 / (totalSteps - 1) : 0;
    const start = 0.15 + index * segmentSize;
    const end = start + segmentSize;
    const lineHeight = useTransform(scrollProgress, [start, end], ["0%", "100%"]);

    return (
        <div className="flex gap-6 flex-1">
            {/* Icon and Line Column */}
            <div className="flex flex-col items-center">
                {/* Icon Box - Outer container with gradient border */}
                <div className="relative h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-t from-border to-foreground/35 p-[1px]">
                    {/* Inner container with shiny top strip */}
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-card">
                        {/* White strip at top for shiny effect */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
                        <Icon className="h-5 w-5 text-foreground" />
                    </div>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                    <div className="relative w-0.5 flex-1 min-h-[120px] mt-4">
                        {/* Base line (dim) */}
                        <div className="absolute inset-0 rounded-full bg-border" />
                        {/* Animated highlight line */}
                        <motion.div
                            className="absolute top-0 left-0 w-full rounded-full bg-linear-to-b from-[#fbbf24] via-[#f59e0b] to-[#b45309]"
                            style={{ height: lineHeight }}
                        />
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className="pt-2 flex-1">
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
                    index={index}
                    totalSteps={steps.length}
                    scrollProgress={scrollYProgress}
                />
            ))}
        </div>
    );
};
