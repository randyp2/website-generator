"use client";

import { motion } from "framer-motion";
import React from "react";

export const HeaderSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="text-center max-w-3xl mx-auto"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 font-semibold text-sm mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        Step 1 of 3
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
        Choose Your Starting Point
      </h1>
      <p className="text-lg pb-5 text-white/80 leading-relaxed">
        Pick a template that matches your style, or start from scratch.
        Customize it further with{" "}
        <span className="text-2xl font-semibold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">AI</span> in the
        next step.
      </p>
    </motion.div>
  );
};
