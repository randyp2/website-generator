"use client";

import React, { useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { GradientButton } from "./gradient-button";
import Image from "next/image";

const screenshotUrl =
    "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=2400&q=80";

function HeroSplineBackground() {
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                pointerEvents: "auto",
                overflow: "hidden",
            }}
        >
            <Spline
                style={{
                    width: "100%",
                    height: "100vh",
                    pointerEvents: "auto",
                }}
                scene="https://prod.spline.design/dJqTIQ-tE3ULUPMi/scene.splinecode"
            />
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
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
        <section className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 mt-11 md:mt-12">
            <div
                ref={screenshotRef}
                className="pb-5 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 w-full md:w-[80%] lg:w-[70%] mx-auto"
                style={{
                    boxShadow: "0 0 60px rgba(99, 221, 255, 0.15), 0 0 100px rgba(80, 180, 220, 0.08)"
                }}
            >
                <div>
                    <Image
                        src="/images/dashboard_layout.png"
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
        </section>
    );
}

function HeroContent() {
    return (
        <div className="relative text-white px-4 max-w-7xl mx-auto w-full flex flex-col lg:flex-row justify-between items-start lg:items-center py-16">
            <div className="pointer-events-none absolute -inset-x-10 -top-12 h-64 blur-3xl bg-[radial-gradient(circle_at_20%_40%,rgba(99,221,255,0.06),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 blur-3xl bg-[radial-gradient(circle_at_70%_50%,rgba(80,180,220,0.05),transparent_42%)]" />

            <div className="w-full lg:w-1/2 pr-0 lg:pr-8 mb-8 lg:mb-0 relative z-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-wide drop-shadow-[0_12px_34px_rgba(0,200,255,0.18)]">
                    Build your portfolio websites now
                </h1>
                <div className="text-sm text-gray-200 opacity-90 mt-4">
                    Built in minutes / Tailored to your craft / Ready to deploy
                </div>
            </div>

            <div className="w-full lg:w-1/2 pl-0 lg:pl-8 flex flex-col items-start relative z-10">
                <p className="text-base sm:text-lg opacity-85 mb-6 max-w-md drop-shadow-[0_10px_24px_rgba(0,200,255,0.16)]">
                    Generate a stunning, on-brand portfolio without code. Import
                    your resume, pick a style, and publish instantly.
                </p>
                <div className="flex pointer-events-auto flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                    <GradientButton className="w-full sm:w-auto">
                        Try a Demo
                    </GradientButton>
                    <GradientButton
                        variant="variant"
                        className="w-full sm:w-auto inline-flex items-center gap-2"
                    >
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        Get Started
                    </GradientButton>
                </div>
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
                    if (!screenshotRef.current || !heroContentRef.current)
                        return;
                    const scrollPosition = window.pageYOffset;
                    screenshotRef.current.style.transform = `translateY(-${
                        scrollPosition * 0.5
                    }px)`;
                    const maxScroll = 400;
                    const opacity = 1 - Math.min(scrollPosition / maxScroll, 1);
                    heroContentRef.current.style.opacity = opacity.toString();
                });
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative">
            <div className="relative min-h-screen">
                <div className="absolute inset-0 z-0 pointer-events-auto">
                    <HeroSplineBackground />
                </div>
                <div
                    ref={heroContentRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                        pointerEvents: "none",
                    }}
                >
                    <HeroContent />
                </div>
            </div>
            <div
                className="relative z-10"
                style={{
                    marginTop: "-10vh",
                    backgroundColor: "#030506",
                }}
            >
                <ScreenshotSection screenshotRef={screenshotRef} />

            </div>
        </div>
    );
}

export { HeroSection };
