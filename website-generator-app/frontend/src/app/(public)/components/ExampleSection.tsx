"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import router from "next/router";
import React from "react";
import { FiArrowRight, FiZap } from "react-icons/fi";


const examples = [
    {
        name: "Alex Chen",
        role: "Full-Stack Developer",
        theme: "Minimal Light",
        gradient: "from-slate-100 to-slate-200",
    },
    {
        name: "Sarah Williams",
        role: "UX Designer",
        theme: "Nature Zen",
        gradient: "from-emerald-100 to-teal-100",
    },
    {
        name: "Marcus Reid",
        role: "Data Scientist",
        theme: "Cyberpunk Dark",
        gradient: "from-violet-200 to-purple-200",
    },
];

export const ExampleSection: React.FC = () => {
    const router = useRouter(); 
    
    return (
        <section className="py-20 px-6 bg-gray-100">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">
                        Portfolio Examples
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        See what our AI can create for you — each portfolio is unique,
                        professional, and ready to impress.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {examples.map((example, index) => (
                        <motion.div
                            key={index}
                            
                            transition={{ duration: 0.3 }}
                            whileHover={{
                                y: -12,
                                rotate: index % 2 === 0 ? 2 : -2,
                            }}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:border-cyan-200 transition-shadow cursor-pointer"
                        >
                            <div
                                className={`h-48 bg-linear-to-br ${example.gradient} flex items-center justify-center relative`}
                            >
                                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-slate-700 font-semibold flex items-center gap-2">
                                        View Portfolio <FiArrowRight />
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                    {example.name}
                                </h3>
                                <p className="text-slate-600 text-sm mb-3">{example.role}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-xs font-medium text-slate-700">
                                    <FiZap className="w-3 h-3 text-cyan-500" />
                                    {example.theme}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/examples")}
                        className="px-8 py-3 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all hover:cursor-pointer"
                    >
                        View All Examples
                    </motion.button>
                </div>
            </div>
        </section>
    );
}