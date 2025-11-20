"use client";

import { motion } from "framer-motion";
import React from "react";

export const HeaderSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-3xl mx-auto"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full text-sky-700 font-semibold text-sm mb-4">
        Step 1 of 3
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        Choose Your Starting Point
      </h1>
      <p className="text-lg text-slate-600">
        Pick a template that matches your style, or start from scratch.
        Customize it further with{" "}
        <span className="text-2xl font-semibold text-sky-400">AI</span> in the
        next step.
      </p>
    </motion.div>
  );
};
