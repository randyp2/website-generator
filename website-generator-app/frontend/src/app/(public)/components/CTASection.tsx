"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

export const CTASection: React.FC = () => {
    return (
        <section className="relative py-20 px-6 bg-[#030506] text-white overflow-hidden min-h-[50vh] flex items-center justify-center">
            <div className="max-w-6xl mx-auto w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-3xl mx-auto text-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-12 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
                >
                    <div className="mx-auto mb-6 h-10 w-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                        <div className="h-2 w-6 rounded-full bg-white/60" />
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4"
                    >
                        Launch your next portfolio in minutes
                    </h2>

                    <p className="text-base md:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A professional, code-free way to present your work. Import your resume, apply your brand, and publish with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <GradientButton className="w-full sm:w-auto px-8 py-3 shadow-[0_12px_35px_rgba(255,255,255,0.12)] hover:shadow-[0_18px_45px_rgba(255,255,255,0.22)] transition-all duration-500">
                            Get Started Free
                        </GradientButton>
                        <GradientButton
                            variant="variant"
                            className="w-full sm:w-auto px-8 py-3 inline-flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(255,255,255,0.12)] hover:shadow-[0_18px_45px_rgba(255,255,255,0.22)] transition-shadow duration-500"
                        >
                            View Demo
                            <ArrowUpRight className="w-5 h-5" />
                        </GradientButton>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="text-sm text-white/50"
                    >
                        No credit card required · Publish-ready outputs · Stay on brand
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
};
