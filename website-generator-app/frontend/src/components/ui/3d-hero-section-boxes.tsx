"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { GradientButton } from "./gradient-button";
import Image from "next/image";
import { GodRays } from "@paper-design/shaders-react";

const screenshotUrl =
    "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=2400&q=80";

function ExpandingCircleBackground({
    circleRef,
}: {
    circleRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div
            ref={circleRef}
            className="absolute pointer-events-none"
            style={{
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background:
                    "radial-gradient(circle, #26282a 0%, #26282a 50%, rgba(38, 40, 42, 0.8) 75%, transparent 100%)",
                willChange: "width, height, opacity",
                zIndex: 1,
                opacity: 0.6,
            }}
        />
    );
}

function HeroSplineBackground({
    opacity = 1,
}: {
    opacity?: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Create IntersectionObserver to track visibility
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsInView(entry.isIntersecting);
                });
            },
            {
                threshold: 0, // Trigger as soon as any part is visible
                rootMargin: "100px", // Start rendering 100px before entering viewport
            },
        );

        observer.observe(container);

        // Cleanup function
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                overflow: "hidden",
                opacity: opacity,
                transition: "opacity 0.1s ease-out",
            }}
            className="bg-[#0a0a0a] z-0"
        >
            <div className="absolute inset-0 pointer-events-none">
                {isInView && (
                    <GodRays
                        colorBack="#00000000"
                        colors={[
                            "#a1a1aa40",
                            "#e4e4e740",
                            "#71717a40",
                            "#52525b40",
                        ]}
                        colorBloom="#a1a1aa"
                        offsetX={0.85}
                        offsetY={-1}
                        intensity={0.5}
                        spotty={0.45}
                        midSize={10}
                        midIntensity={0}
                        density={0.25}
                        bloom={0.2}
                        speed={0.5}
                        scale={1.6}
                        frame={3332042.8159981333}
                        minPixelRatio={0.75}
                        style={{
                            height: "100%",
                            width: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                        }}
                    />
                )}
                {!isInView && (
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(circle at 85% -100%, rgba(161, 161, 170, 0.1) 0%, transparent 50%)",
                        }}
                    />
                )}
            </div>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(21, 29, 33, 0.32)",
                    pointerEvents: "none",
                }}
            />
        </div>
    );
}

function ScreenshotSection({
    screenshotRef,
}: {
    screenshotRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div
            style={{
                perspective: "1200px",
                perspectiveOrigin: "center center",
                width: "100%",
                maxWidth: "1200px",
                marginTop: "-110px",
            }}
        >
            <div
                ref={screenshotRef}
                className="pb-5 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 relative z-20"
                style={{
                    boxShadow:
                        "0 0 60px rgba(99, 221, 255, 0.15), 0 0 100px rgba(80, 180, 220, 0.08)",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    willChange: "transform",
                    transform:
                        "translateY(0px) rotateX(25deg) rotateY(0deg) translateZ(0px) scale(1)",
                    width: "100%",
                    height: "auto",
                }}
            >
                <div style={{ width: "100%", height: "auto" }}>
                    <Image
                        src="/images/dashboard_preview.png"
                        alt="Dashboard Preview Screenshot"
                        width={1400}
                        height={1400}
                        priority
                        className="w-full h-full block rounded-lg mx-auto object-cover"
                    />
                </div>

                <p className="mt-6 text-center text-slate-200 text-sm md:text-base max-w-2xl mx-auto">
                    Your own personalized dashboard to manage your deployed or
                    work-in-progress portflios
                </p>
            </div>
        </div>
    );
}

function HeroContent({
    heroContentRef,
}: {
    heroContentRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div
            ref={heroContentRef}
            className="relative z-0 text-white px-4 max-w-4xl mx-auto w-3/4 flex flex-col items-center gap-4 pt-[180px] pb-[80px]"
            style={{
                fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <div className="pointer-events-none absolute -inset-x-10 -top-12 h-64 blur-3xl bg-[radial-gradient(circle_at_20%_40%,rgba(99,221,255,0.06),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 blur-3xl bg-[radial-gradient(circle_at_70%_50%,rgba(80,180,220,0.05),transparent_42%)]" />

            <div className="text-center relative z-10">
                <h1 className="text-[48px] font-bold leading-[1.1em] tracking-[-0.04em] mb-2">
                    Build your portfolio<br />website now
                </h1>
                <div className="text-[16px] leading-6 text-gray-200 opacity-90 mt-2">
                    Built in minutes / Tailored to your craft / Ready to deploy
                </div>
            </div>

            <p className="text-[18px] leading-[1.3em] tracking-[-0.04em] text-center opacity-85 max-w-md relative z-10">
                Generate a stunning, on-brand portfolio without code. Import
                your resume, pick a style, and publish instantly.
            </p>

            <div className="flex pointer-events-auto flex-col sm:flex-row items-center gap-4 relative z-10">
                <GradientButton className="w-full sm:w-auto h-12 px-6">
                    Try a Demo
                </GradientButton>
                <GradientButton
                    variant="variant"
                    className="w-full sm:w-auto h-12 px-6 inline-flex items-center gap-2"
                >
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    Get Started
                </GradientButton>
            </div>
        </div>
    );
}

function HeroSection() {
    const screenshotRef = useRef<HTMLDivElement | null>(null);
    const heroContentRef = useRef<HTMLDivElement | null>(null);
    const circleRef = useRef<HTMLDivElement | null>(null);
    const [godRaysOpacity, setGodRaysOpacity] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            if (screenshotRef.current && heroContentRef.current) {
                requestAnimationFrame(() => {
                    if (!screenshotRef.current || !heroContentRef.current)
                        return;

                    const scrollPosition = window.pageYOffset;

                    // Simplified scroll calculation - start from page top
                    const maxScroll = 600; // Scroll range for full effect
                    const rawProgress = Math.min(scrollPosition / maxScroll, 1);

                    // Cubic easing for smooth motion
                    const progress = 1 - Math.pow(1 - rawProgress, 3);

                    // Mobile detection
                    const isMobile = window.innerWidth < 768;
                    const intensity = isMobile ? 0.5 : 1.0;

                    // DASHBOARD: Untilt effect 25° → 0°
                    const startRotateX = 25;
                    const rotateX = (startRotateX - progress * 25) * intensity;

                    // No Y rotation - keep tilt uniform across top edge
                    const rotateY = 0;

                    // Move backward in Z space
                    const translateZ = -(progress * 80 * intensity);

                    // Slight scale for depth perception
                    const dashboardScale = 1 - progress * 0.05 * intensity;

                    // Smooth parallax - reduced to keep screenshot on screen when untilted
                    const translateY = -(scrollPosition * 0.1);

                    // Apply combined transform to dashboard
                    screenshotRef.current.style.transform = `
                        translateY(${translateY}px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        translateZ(${translateZ}px)
                        scale(${dashboardScale})
                    `;

                    // TITLE: Slide down effect - moves downward as screenshot untilts
                    // Text slides down and disappears behind the screenshot
                    // Increased distance to ensure complete hiding behind screenshot
                    const titleTranslateY = progress * 400 * intensity;

                    // Fade out effect - text fades from 1 to 0 as screenshot untilts
                    const titleOpacity = 1 - progress;

                    heroContentRef.current.style.transform = `translateY(${titleTranslateY}px)`;
                    heroContentRef.current.style.opacity = `${titleOpacity}`;
                    heroContentRef.current.style.transformOrigin = "center top";

                    // EXPANDING CIRCLE: Expand grey gradient outward
                    if (circleRef.current) {
                        // Expand circle from 600px to cover entire viewport
                        const startSize = 600;
                        const endSize =
                            Math.max(window.innerWidth, window.innerHeight) *
                            3;

                        // Smooth, organic easing with acceleration burst
                        // Creates a less precise, more fluid expansion
                        const easeProgress = Math.pow(progress, 1.8);

                        const currentSize =
                            startSize + (endSize - startSize) * easeProgress;

                        // Increase opacity to full solid: 0.6 → 1.0
                        const circleOpacity = 0.6 + progress * 0.4;

                        circleRef.current.style.width = `${currentSize}px`;
                        circleRef.current.style.height = `${currentSize}px`;
                        circleRef.current.style.opacity = `${circleOpacity}`;
                    }

                    // GODRAYS FADE: Fade out as grey circle expands
                    const newGodRaysOpacity = 1 - progress * 0.7; // Fade to 30%
                    setGodRaysOpacity(newGodRaysOpacity);
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initialize on mount

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative bg-[#141415] min-h-screen pb-40">
            <HeroSplineBackground opacity={godRaysOpacity} />
            <ExpandingCircleBackground circleRef={circleRef} />
            <div className="relative z-10 container mx-auto px-4 max-w-6xl">
                <div
                    className="flex flex-col items-center"
                    style={{ gap: "0px" }}
                >
                    <HeroContent heroContentRef={heroContentRef} />
                    <ScreenshotSection screenshotRef={screenshotRef} />
                </div>
            </div>
        </div>
    );
}

export { HeroSection };
