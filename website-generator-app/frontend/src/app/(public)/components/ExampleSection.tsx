"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
        <section className="bg-transparent px-6 py-20 text-foreground">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="mb-4 text-4xl font-bold text-foreground">
                        Portfolio Examples
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
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
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-shadow hover:border-primary/30 hover:shadow-2xl"
                        >
                            <div
                                className={`h-48 bg-linear-to-br ${example.gradient} flex items-center justify-center relative`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center bg-background/35 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                    <span className="flex items-center gap-2 font-semibold text-foreground">
                                        View Portfolio <FiArrowRight />
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="mb-1 text-xl font-semibold text-card-foreground">
                                    {example.name}
                                </h3>
                                <p className="mb-3 text-sm text-muted-foreground">{example.role}</p>
                                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-card-foreground">
                                    <FiZap className="h-3 w-3 text-primary" />
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
                        onClick={() => router.push("/explore")}
                        className="rounded-xl border border-border bg-card px-8 py-3 font-semibold text-card-foreground transition-all hover:cursor-pointer hover:border-primary/30 hover:shadow-md"
                    >
                        View All Examples
                    </motion.button>
                </div>
            </div>
        </section>
    );
}
