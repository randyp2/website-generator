"use client";

import React, { useEffect, useRef } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { GradientButton } from "./gradient-button";
import Image from "next/image";
import { GodRays } from "@paper-design/shaders-react";

const screenshotUrl =
    "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=2400&q=80";

function HeroSplineBackground() {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "200vh",
                pointerEvents: "none",
                overflow: "hidden",
            }}
            className="bg-[#0a0a0a]"
        >
            <div className="absolute inset-0 pointer-events-none">
                <GodRays
                    colorBack="#00000000"
                    colors={["#a1a1aa40", "#e4e4e740", "#71717a40", "#52525b40"]}
                    colorBloom="#a1a1aa"
                    offsetX={0.85}
                    offsetY={-1}
                    intensity={0.5}
                    spotty={0.45}
                    midSize={10}
                    midIntensity={0}
                    density={0.38}
                    bloom={0.3}
                    speed={0.5}
                    scale={1.6}
                    frame={3332042.8159981333}
                    style={{
                        height: "100%",
                        width: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "200vh",
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
                perspective: '1200px',
                perspectiveOrigin: 'center center',
                width: '92%',
            }}
        >
            <div
                ref={screenshotRef}
                className="pb-5 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50"
                style={{
                    boxShadow: "0 0 60px rgba(99, 221, 255, 0.15), 0 0 100px rgba(80, 180, 220, 0.08)",
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    willChange: 'transform',
                    transform: 'translateY(0px) rotateX(15deg) rotateY(0deg) translateZ(0px) scale(1)',
                    aspectRatio: '1.6',
                    height: 'auto',
                }}
            >
            <div>
                <Image
                    src="/images/dashboard_preview.png"
                    alt="Dashboard Preview Screenshot"
                    width={1600}
                    height={900}
                    priority
                    className="w-full h-auto block rounded-lg mx-auto"
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
            className="relative text-white px-4 max-w-4xl mx-auto w-3/4 flex flex-col items-center gap-8 pt-40"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
            <div className="pointer-events-none absolute -inset-x-10 -top-12 h-64 blur-3xl bg-[radial-gradient(circle_at_20%_40%,rgba(99,221,255,0.06),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 blur-3xl bg-[radial-gradient(circle_at_70%_50%,rgba(80,180,220,0.05),transparent_42%)]" />

            <div className="text-center relative z-10">
                <h1 className="text-[80px] font-bold leading-[88px] tracking-[0px] mb-4">
                    Build your portfolio websites now
                </h1>
                <div className="text-[16px] leading-[24px] text-gray-200 opacity-90 mt-4">
                    Built in minutes / Tailored to your craft / Ready to deploy
                </div>
            </div>

            <p className="text-[20px] leading-[32px] tracking-[0px] text-center opacity-85 max-w-md relative z-10">
                Generate a stunning, on-brand portfolio without code. Import
                your resume, pick a style, and publish instantly.
            </p>

            <div className="flex pointer-events-auto flex-col sm:flex-row items-center gap-4 relative z-10">
                <GradientButton className="w-full sm:w-auto h-[48px] px-6">
                    Try a Demo
                </GradientButton>
                <GradientButton
                    variant="variant"
                    className="w-full sm:w-auto h-[48px] px-6 inline-flex items-center gap-2"
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

    useEffect(() => {
        const handleScroll = () => {
            if (screenshotRef.current && heroContentRef.current) {
                requestAnimationFrame(() => {
                    if (!screenshotRef.current || !heroContentRef.current) return;

                    const scrollPosition = window.pageYOffset;

                    // Simplified scroll calculation - start from page top
                    const maxScroll = 600; // Scroll range for full effect
                    const rawProgress = Math.min(scrollPosition / maxScroll, 1);

                    // Cubic easing for smooth motion
                    const progress = 1 - Math.pow(1 - rawProgress, 3);

                    // Mobile detection
                    const isMobile = window.innerWidth < 768;
                    const intensity = isMobile ? 0.5 : 1.0;

                    // DASHBOARD: Untilt effect 15° → 0°
                    const startRotateX = 15;
                    const rotateX = (startRotateX - (progress * 15)) * intensity;

                    // No Y rotation - keep tilt uniform across top edge
                    const rotateY = 0;

                    // Move backward in Z space
                    const translateZ = -(progress * 80 * intensity);

                    // Slight scale for depth perception
                    const dashboardScale = 1 - (progress * 0.05 * intensity);

                    // Smooth parallax
                    const translateY = -(scrollPosition * 0.3);

                    // Apply combined transform to dashboard
                    screenshotRef.current.style.transform = `
                        translateY(${translateY}px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        translateZ(${translateZ}px)
                        scale(${dashboardScale})
                    `;

                    // TITLE: Zoom out effect 1.0 → 0.85 (synchronized with dashboard)
                    const titleScale = 1 - (progress * 0.15);
                    heroContentRef.current.style.transform = `scale(${titleScale})`;
                    heroContentRef.current.style.transformOrigin = 'center top';
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initialize on mount

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative bg-[#141415] min-h-screen">
            <HeroSplineBackground />
            <div className="relative z-10 container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col items-center" style={{ gap: '80px' }}>
                    <HeroContent heroContentRef={heroContentRef} />
                    <ScreenshotSection screenshotRef={screenshotRef} />
                </div>
            </div>
        </div>
    );
}

export { HeroSection };
