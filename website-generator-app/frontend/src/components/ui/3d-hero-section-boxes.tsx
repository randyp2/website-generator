"use client";

import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, stagger, useAnimate } from "framer-motion";

import { GradientButton } from "./gradient-button";
import Floating, { FloatingElement } from "./parallax-floating";

const floatingImages = [
    {
        url: "/images/hero/example1.png",
        title: "Monochrome Portrait",
    },
    {
        url: "/images/hero/example2.png",
        title: "Neon Palm",
    },
    {
        url: "/images/hero/example3.png",
        title: "Blurred Crowd",
    },
    {
        url: "https://images.unsplash.com/photo-1562016600-ece13e8ba570?q=80&w=2838&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Crystal Water",
    },
    {
        url: "https://images.unsplash.com/photo-1624344965199-ed40391d20f2?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Blue Sky Portrait",
    },
    {
        url: "/images/hero/example4.png",
        //url: "https://images.unsplash.com/photo-1689553079282-45df1b35741b?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Flower Crown",
    },
    {
        
        url: "https://images.unsplash.com/photo-1721968317938-cf8c60fccd1a?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "White Flowers",
    },
    {
        url: "https://images.unsplash.com/photo-1677338354108-223e807fb1bd?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Table for Two",
    },
];

function HeroFloatingGallery() {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        animate("img", { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.15) });
    }, [animate]);

    return (
        <div
            className="relative flex w-full min-h-[720px] justify-center items-center overflow-visible"
            ref={scope}
        >
            <motion.div
                className="z-20 text-center space-y-4 items-center flex flex-col"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.88, delay: 1.2 }}
            >
                <p className="text-5xl md:text-7xl text-white font-serif italic tracking-tight">
                    Build your portfolio.
                </p>
                <p className="text-sm text-white/70 max-w-md">
                    Tailored layouts, instant publishing, and a gallery of
                    styles that move with you.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <GradientButton className="w-full sm:w-auto h-11 px-6">
                        Try a Demo
                    </GradientButton>
                    <GradientButton
                        variant="variant"
                        className="w-full sm:w-auto h-11 px-6 inline-flex items-center gap-2"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        Get Started
                    </GradientButton>
                </div>
            </motion.div>

            <Floating sensitivity={-1} className="overflow-visible z-10">
                <FloatingElement depth={0.5} className="top-[8%] left-[11%]">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[0].url}
                        alt={floatingImages[0].title}
                        className="w-16 h-16 md:w-40 md:h-24 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>
                <FloatingElement depth={1} className="top-[10%] left-[32%]">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[1].url}
                        alt={floatingImages[1].title}
                        className="w-20 h-20 md:w-44 md:h-28 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>
                <FloatingElement depth={2} className="top-[2%] left-[53%]">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[2].url}
                        alt={floatingImages[2].title}
                        className="w-28 h-40 md:w-70 md:h-52 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>
                <FloatingElement depth={1} className="top-[0%] left-[83%]">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[3].url}
                        alt={floatingImages[3].title}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>

                <FloatingElement depth={1} className="top-[40%] left-[2%]">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[4].url}
                        alt={floatingImages[4].title}
                        className="w-28 h-28 md:w-36 md:h-36 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>
                <FloatingElement depth={2} className="top-[70%] left-[77%]">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[7].url}
                        alt={floatingImages[7].title}
                        className="w-28 h-28 md:w-36 md:h-48 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>

                <FloatingElement depth={4} className="top-[73%] left-[15%] translate-y-30">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[5].url}
                        alt={floatingImages[5].title}
                        className="w-40 md:w-52 md:h-100 h-full object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>
                <FloatingElement depth={1} className="top-[80%] left-[50%]">
                    <motion.img
                        initial={{ opacity: 0 }}
                        src={floatingImages[6].url}
                        alt={floatingImages[6].title}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                    />
                </FloatingElement>
            </Floating>
        </div>
    );
}

function MarketingHeroSection() {
    return (
        <div className="relative bg-[#141415] min-h-screen">
            <div className="relative z-10 container mx-auto px-4 max-w-6xl">
                <HeroFloatingGallery />
            </div>
        </div>
    );
}

export { MarketingHeroSection };
