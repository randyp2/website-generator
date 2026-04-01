"use client";

import React, { forwardRef, useRef } from "react";
import Image from "next/image";
import { Claude, Gemini, OpenAI } from "@lobehub/icons";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex size-16 items-center justify-center rounded-full border-2 border-zinc-200 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

export function AnimatedBeamDemo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null);
    const div2Ref = useRef<HTMLDivElement>(null);
    const div3Ref = useRef<HTMLDivElement>(null);
    const div4Ref = useRef<HTMLDivElement>(null);
    const div5Ref = useRef<HTMLDivElement>(null);
    const div6Ref = useRef<HTMLDivElement>(null);
    const div7Ref = useRef<HTMLDivElement>(null);
    const beamStyle = {
        pathColor: "#d1d5db",
        pathOpacity: 0.35,
        gradientStartColor: "#d1d5db",
        gradientStopColor: "#f3f4f6",
    } as const;

    return (
        <div
            className="relative flex h-[500px] w-full items-center justify-center overflow-hidden p-8 md:p-10"
            ref={containerRef}
        >
            <div className="flex size-full max-h-[340px] max-w-5xl flex-col items-stretch justify-between gap-14">
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div1Ref}>
                        <Gemini.Color size={24} />
                    </Circle>
                    <Circle ref={div5Ref}>
                        <Image
                            src="/images/logos/resume.png"
                            alt="Resume"
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div2Ref}>
                        <OpenAI.Avatar size={24} />
                    </Circle>
                    <Circle ref={div4Ref} className="size-20 p-4">
                        <Image
                            src="/images/logos/website.gif"
                            alt="Website"
                            width={36}
                            height={36}
                            className="object-contain"
                            unoptimized
                        />
                    </Circle>
                    <Circle ref={div6Ref}>
                        <Image
                            src="/images/logos/photos.png"
                            alt="Photos"
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div3Ref}>
                        <Claude.Color size={24} />
                    </Circle>
                    <Circle ref={div7Ref}>
                        <Image
                            src="/images/logos/video.png"
                            alt="Video"
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                    </Circle>
                </div>
            </div>

            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div4Ref}
                curvature={-120}
                endYOffset={-10}
                {...beamStyle}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div4Ref}
                curvature={-35}
                {...beamStyle}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div4Ref}
                curvature={110}
                endYOffset={10}
                {...beamStyle}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div5Ref}
                toRef={div4Ref}
                curvature={-120}
                endYOffset={-10}
                reverse
                {...beamStyle}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div4Ref}
                curvature={35}
                reverse
                {...beamStyle}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div7Ref}
                toRef={div4Ref}
                curvature={110}
                endYOffset={10}
                reverse
                {...beamStyle}
            />
        </div>
    );
}
