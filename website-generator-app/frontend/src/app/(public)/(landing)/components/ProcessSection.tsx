"use client";

import React from "react";
import Image from "next/image";
import { Zap, Cpu, Headphones } from "lucide-react";
import { ScrollTimeline, TimelineStep } from "@/components/ui/scroll-timeline";

const PROCESS_STEPS: TimelineStep[] = [
    {
        icon: Zap,
        title: "Pick a template",
        description:
            "Choose a layout that matches your style and personalize it to fit your brand.",
    },
    {
        icon: Cpu,
        title: "Upload resume",
        description:
            "Upload your resume and we will extract your experience, skills, and projects automatically.",
    },
    {
        icon: Headphones,
        title: "Refine with AI",
        description:
            "Use AI suggestions to improve your content, then publish a polished portfolio in minutes.",
    },
];

export const ProcessSection: React.FC = () => {
    return (
        <section className="relative overflow-visible bg-muted/35 px-6 py-20 text-foreground dark:bg-background">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center">
                    {/* Title Badge */}
                    <div className="inline-flex items-center justify-center mb-6">
                        <span className="rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground/90 dark:text-secondary-foreground/90">
                            How it works
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="mb-4 text-4xl font-bold text-foreground/85 dark:text-foreground/90 md:text-5xl">
                        The simplest way to build your portfolio
                    </h2>
                </div>

                {/* Two-column layout below title */}
                <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 items-start gap-12">
                    {/* Left Column: Timeline */}
                    <ScrollTimeline
                        steps={PROCESS_STEPS}
                        className="h-[750px]"
                    />

                    {/* Right Column: Dashboard Image */}
                    <div className="relative overflow-visible">
                        <div className="relative h-[645px] w-[1150px] max-w-none translate-x-28 overflow-hidden rounded-2xl border border-border shadow-[0_0_40px_rgba(245,158,11,0.35),0_0_70px_rgba(146,64,14,0.25)] lg:translate-x-20">
                            <Image
                                src="/images/dashboard_preview.png"
                                alt="Dashboard preview"
                                fill
                                sizes="(min-width: 1024px) 1150px, 90vw"
                                className="object-cover"
                                quality={100}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
