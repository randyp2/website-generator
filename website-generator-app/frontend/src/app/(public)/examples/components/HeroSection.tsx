"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import { FiArrowRight } from "react-icons/fi";

export const HeroSection: React.FC = () => {
    const router = useRouter();
    
    return (
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            Portfolio Examples
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Explore our collection of AI-generated portfolios. Each one is
            unique, professional, and customizable to your needs.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold  shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-shadow inline-flex items-center gap-2 hover:cursor-poin"
          >
            Create Your Own
            <FiArrowRight />
          </motion.button>
        </section>
    );
}