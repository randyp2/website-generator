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
        <section className="relative py-20 px-6 bg-black text-white overflow-visible">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center">
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
                        <div className="relative w-[1150px] h-[645px] max-w-none translate-x-28 lg:translate-x-20 rounded-2xl border border-white/60 shadow-[0_0_40px_rgba(59,130,246,0.45),0_0_80px_rgba(255,255,255,0.25)] overflow-hidden">
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
