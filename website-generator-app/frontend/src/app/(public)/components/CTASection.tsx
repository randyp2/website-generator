"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

export const CTASection: React.FC = () => {
    return (
        <section className="relative py-20 px-6 bg-[#030506] text-white overflow-hidden min-h-[60vh] flex items-center justify-center">
            <div className="max-w-7xl mx-auto w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-3xl mx-auto text-center"
                >
                    {/* Sparkles Icon */}
                    <motion.div
                        animate={{
                            rotate: [0, 5, -5, 0],
                            y: [0, -5, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="inline-block mb-6"
                    >
                        <div
                            className="w-16 h-16 rounded-full bg-[#0a0f12] border-2 border-cyan-500/40 flex items-center justify-center"
                            style={{
                                boxShadow:
                                    "0 0 30px rgba(99, 221, 255, 0.3)",
                            }}
                        >
                            <Sparkles className="w-8 h-8 text-cyan-400" />
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                        style={{
                            textShadow:
                                "0 12px 34px rgba(0, 200, 255, 0.18)",
                        }}
                    >
                        Ready to Build Your Portfolio?
                    </h2>

                    {/* Supporting Text */}
                    <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of professionals showcasing their work
                        with AI-powered portfolios. Get started in minutes, no
                        credit card required.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <GradientButton className="w-full sm:w-auto px-8 py-3">
                            Get Started Free
                        </GradientButton>
                        <GradientButton
                            variant="variant"
                            className="w-full sm:w-auto px-8 py-3 inline-flex items-center justify-center gap-2"
                        >
                            View Demo
                            <ArrowUpRight className="w-5 h-5" />
                        </GradientButton>
                    </div>

                    {/* Trust Badge */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="text-sm text-slate-400"
                    >
                        No credit card required • Free tier available
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
};
